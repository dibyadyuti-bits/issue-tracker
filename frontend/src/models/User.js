// User model/type definition
export class User {
  constructor(id, name, email, role = 'user') {
    this.id = id;
    this.name = name;
    this.email = email;
    this.role = role;
  }
}

export const UserRole = {
  USER: 'user',
  ADMIN: 'admin'
};
