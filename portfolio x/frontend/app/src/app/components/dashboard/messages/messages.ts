import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardLayoutComponent } from '../dashboard-layout/dashboard-layout';
import { ContactService } from '../../../services/contact.service';
import { Contact } from '../../../models/contact.model';

@Component({
  selector: 'app-messages',
  standalone: true,
  imports: [CommonModule, DashboardLayoutComponent],
  providers: [ContactService],
  templateUrl: './messages.html',
  styleUrls: ['./messages.css'],
})
export class MessagesComponent implements OnInit {
  contacts = signal<Contact[]>([]);
  loading = signal(true);
  message = signal('');
  isSuccess = signal(false);
  filterStatus = signal<string>('');

  constructor(private contactService: ContactService) {}

  ngOnInit(): void {
    this.loadMessages();
  }

  // Use index-based tracking to avoid undefined errors
  trackByIndex(index: number, item: any): number {
    return index;
  }

  // Fixed: Use computed signal for filtered contacts
  filteredContacts = computed(() => {
    const status = this.filterStatus();
    const allContacts = this.contacts();
    if (!status) return allContacts;
    return allContacts.filter(
      (contact) => contact && contact.status === status
    );
  });

  // Get contact statistics
  contactStats = computed(() => {
    const allContacts = this.contacts();
    return {
      total: allContacts.length,
      unread: allContacts.filter((c) => c.status === 'unread').length,
      read: allContacts.filter((c) => c.status === 'read').length,
      replied: allContacts.filter((c) => c.status === 'replied').length,
    };
  });

  loadMessages(): void {
    console.log('🔄 Loading messages...');
    this.loading.set(true);
    this.message.set('');

    this.contactService.getContacts().subscribe({
      next: (data: any) => {
        console.log('✅ Raw API response:', data);

        // Handle different response formats
        let contactsArray: any[] = [];

        if (Array.isArray(data)) {
          contactsArray = data;
        } else if (data && typeof data === 'object' && data.contacts) {
          contactsArray = data.contacts;
        } else if (data && typeof data === 'object') {
          contactsArray = [data];
        }

        console.log('📊 Final contacts array:', contactsArray);
        this.contacts.set(contactsArray);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('❌ Error loading messages:', error);
        this.message.set(
          'Failed to load messages: ' + (error.error?.message || error.message)
        );
        this.isSuccess.set(false);
        this.loading.set(false);
        this.contacts.set([]);
      },
    });
  }

  setFilter(status: string): void {
    this.filterStatus.set(status);
  }

  clearFilter(): void {
    this.filterStatus.set('');
  }

  updateStatus(id: string, status: 'read' | 'replied'): void {
    if (!id) {
      console.error('❌ Cannot update status: invalid ID', id);
      return;
    }

    console.log(`🔄 Updating message ${id} status to ${status}`);
    this.contactService.updateContactStatus(id, status).subscribe({
      next: (response) => {
        console.log('✅ Status updated:', response);
        this.message.set(response.message);
        this.isSuccess.set(true);
        this.loadMessages(); // Reload to get updated data
      },
      error: (error) => {
        console.error('❌ Status update failed:', error);
        this.message.set(error.error?.message || 'Update failed');
        this.isSuccess.set(false);
      },
    });
  }

  deleteMessage(id: string): void {
    if (!id) {
      console.error('❌ Cannot delete message: invalid ID', id);
      return;
    }

    if (confirm('Are you sure you want to delete this message?')) {
      console.log(`🗑️ Deleting message: ${id}`);
      this.contactService.deleteContact(id).subscribe({
        next: (response) => {
          console.log('✅ Message deleted:', response);
          this.message.set(response.message);
          this.isSuccess.set(true);
          this.loadMessages(); // Reload to get updated data
        },
        error: (error) => {
          console.error('❌ Delete failed:', error);
          this.message.set(error.error?.message || 'Delete failed');
          this.isSuccess.set(false);
        },
      });
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'unread':
        return 'status-unread';
      case 'read':
        return 'status-read';
      case 'replied':
        return 'status-replied';
      default:
        return 'status-default';
    }
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'unread':
        return '📧';
      case 'read':
        return '👁️';
      case 'replied':
        return '✅';
      default:
        return '📄';
    }
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'Unknown date';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return 'Invalid date';
    }
  }

  refreshMessages(): void {
    this.loadMessages();
  }
}
