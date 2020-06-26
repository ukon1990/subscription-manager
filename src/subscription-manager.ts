import {Observable, Subscribable, Subscription} from 'rxjs';

export class SubscriptionManager {
  private list: Subscription[] = [];
  private map: Map<string, Subscription> = new Map<string, Subscription>();

  public getList(): Subscription[] {
    return this.list;
  }

  public getMap(): Map<string, Subscription> {
    return this.map;
  }

  /**
   * Adds the subscription to an array of subscriptions.
   * There are two optional parameters in the options param.
   *
   * @param emitter
   * @param fun
   * @param options {
   *   @param label Adds the subscription to the map variable, so that you can unsubscribe at that spesific event manually.
   *   @param terminateUponEvent Terminates the subscription on the first event fire
   * }
   */
  public add(
    emitter: Subscribable<any>,
    fun: Function,
    options?: {
      id?: string;
      terminateUponEvent?: boolean;
    }): Subscription {

    const subscription = (emitter as Observable<any>)
        .subscribe((data?: any) => {
      if (options && options.terminateUponEvent) {
        if (subscription) {
          subscription.unsubscribe();
        }
      }

      fun(data);
    });
    this.list.push(subscription);

    if (options && options.id) {
      this.map.set(options.id, subscription);
    }

    return subscription;
  }

  public unsubscribe(): void {
    this.list.forEach(s => {
      if (s) {
        s.unsubscribe();
      }
    });
    this.list.length = 0;
  }

  public unsubscribeById(id: string) {
    const subscription = this.map.get(id);
    if (subscription) {
      subscription.unsubscribe();
      this.map.delete(id);
    }
  }



  public getById(id: string) {
    return this.getMap().get(id);
  }
}
