export class Activity {
  date: string;
  startTime: string;
  endTime: string;
  name: string;
  type: string;
  person: string;
  place: string;
  minutesToStart?: number;

  constructor() {}

  deserialize(activity: any) {
    Object.assign(this, activity);
    return this;
  }
}
