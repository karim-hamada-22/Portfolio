export interface Contact {
  _id?: string;
  id?: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'unread' | 'read' | 'replied';
  ipAddress?: string;
  userAgent?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateContactRequest {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export interface ContactStats {
  total: number;
  unread: number;
  read: number;
  replied: number;
  responseRate: number;
}

export interface ContactResponse {
  message: string;
  contact: Partial<Contact>;
}

export interface ContactUpdateResponse {
  message: string;
  contact: Contact;
}

export interface ContactDeleteResponse {
  message: string;
}
