export class Activity {
  date: string;
  startTime: string;
  endTime: string;
  name: string;
  type: string;
  person: string;
  place: string;

  constructor() {}

  deserialize(activity: any) {
    Object.assign(this, activity);
    return this;
  }
}
