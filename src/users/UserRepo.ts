import { User } from '../models/User';

export interface UserRepo {
  getUserById(userId: number): Promise<User>;
  saveUser(user: User): any;
  load(): any;
  save(): any;
}
