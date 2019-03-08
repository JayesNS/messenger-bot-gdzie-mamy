import * as fs from 'fs';
import { TSMap } from 'typescript-map';

import { UserRepo } from './UserRepo';
import { User } from '../models';

const LOCAL_DATA_PATH = './data/users.json';

export class LocalUserRepo implements UserRepo {
  private static _instance: LocalUserRepo;
  private users: TSMap<number, User> = new TSMap();

  private constructor(private localDataPath: string = LOCAL_DATA_PATH) {
    this.load();
  }

  static get Instance() {
    return this._instance || (this._instance = new this());
  }

  hasUser(userId: number): boolean {
    return !!this.users.has(userId);
  }

  async getUserById(userId: number): Promise<User> {
    if (this.hasUser(userId)) {
      return this.users.get(userId);
    } else {
      return await this.saveUser(new User(userId));
    }
  }

  async saveUser(user: User): Promise<User> {
    this.users.set(user.id, user);
    await this.save();
    return user;
  }

  save(): Promise<TSMap<number, User>> {
    return new Promise((resolve, reject) => {
      fs.writeFile(
        this.localDataPath,
        JSON.stringify(this.users.toJSON()),
        'utf-8',
        (err: NodeJS.ErrnoException) => {
          if (err) {
            reject(err);
          }

          resolve(this.users);
        }
      );
    });
  }

  load(): Promise<TSMap<number, User>> {
    return new Promise((resolve, reject) => {
      fs.exists(this.localDataPath, (exists: boolean) => {
        if (!exists) {
          reject();
        }
        fs.readFile(this.localDataPath, 'utf-8', (err: NodeJS.ErrnoException, data: string) => {
          if (err || !data) {
            reject(err);
          }
          resolve(new TSMap<number, User>().fromJSON(JSON.parse(data)));
        });
      });
    });
  }
}
