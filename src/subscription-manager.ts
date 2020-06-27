import {Observable, Subscribable, Subscription} from 'rxjs';

class MappedSubscription {
  index: number;
  subscription: Subscription;
}

export class SubscriptionManager {
  private list: Subscription[] = [];
  private map: Map<string, MappedSubscription> = new Map<string, MappedSubscription>();

  public getList(): Subscription[] {
    return this.list;
  }

  public getMap(): Map<string, MappedSubscription> {
    return this.map;
  }

  /**
   * Adds the subscription to an array of subscriptions, that are unsubscribed upon
   * the first event. This is a wrapper function over the add function, replacing the need for
   * the option terminateUponEvent.
   * There are two optional parameters in the options param.
   *
   * @param emitter
   * @param fun
   * @param options {
   *   @param label Adds the subscription to the map variable, so that you can unsubscribe at that spesific event manually
   * }
   */
  addSingleEvent(
      emitter: Subscribable<any>,
      fun: Function,
      options?: {
        id?: string;
      }): Subscription {
    return this.add(emitter, fun, {
      ...options,
      terminateUponEvent: true
    });
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
    const newIndex = this.list.length;

    const subscription = (emitter as Observable<any>)
        .subscribe((data?: any) => {
      if (options && options.terminateUponEvent) {
        if (subscription) {
          subscription.unsubscribe();

          if (options.id) {
            this.unsubscribeById(options.id);
          } else {
            this.list.splice(newIndex, 1);
          }
        }
      }

      fun(data);
    });
    this.list.push(subscription);

    if (options && options.id) {
      this.map.set(options.id, {
        subscription,
        index: this.list.length - 1,
      });
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
    this.map = new Map<string, MappedSubscription>();
  }

  public unsubscribeById(id: string) {
    const subscription = this.map.get(id);
    if (subscription) {
      subscription.subscription.unsubscribe();
      this.map.delete(id);
      this.list.splice(subscription.index, 1);
    }
  }



  public getById(id: string): Subscription {
    const sub: MappedSubscription = this.getMap().get(id);
    if (sub) {
      return sub.subscription;
    }
    return undefined;
  }
}
