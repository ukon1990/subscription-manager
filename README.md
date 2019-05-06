# RXjs Subscription manager
This does hopefully make subscription management less tedious, and helps clean up your code with less variables.

You can install it like this:``npm i --save @ukon1990/subscription-manager``

Originally this code base were written before I found out about the 
basic ``subscription.add()``, but then you need to write more code manually. But i still find this method preferable, 
for my use-cases.

So when using this package, you do (in Angular):
```typescript
import {Component, OnDestroy} from '@angular/core';
import {FormBuilder, FormControl, FormGroup} from '@angular/forms';
import {SubscriptionManager} from '@ukon1990/subscription-manager/dist/subscription-manager';
@Component({
  selector: 'app-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.scss']
})
export class ExampleComponent implements OnDestroy {
form: FormGroup;
  subs = new SubscriptionManager();
  changeCount = 0;

  constructor(private builder: FormBuilder) {
    this.form = this.builder.group({
      firstName: new FormControl(),
      surname: new FormControl(),
      age: new FormControl()
    });

    this.subs.add(
      this.form.controls.firstName.valueChanges,
      (change) => this.onNameChange(change), {
          // Unsubscribe upon the first event. 
          // but also makes sure that it is being unsubscribed as usual if no event is triggered
       terminateUponEvent: true
     });
    this.subs.add(
      this.form.controls.surname.valueChanges,
      (change) => this.onNameChange(change), {
          // Providing an ID allows you to unsubscribe to it individually later. Or grab it's subscription.
          // You can do this with subs.unsubscribeById('surname') or subs.get
          id: 'surname'
      });
    this.subs.add(
      this.form.controls.age.valueChanges,
      (change) => this.onAgeChange(change));
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
  // Other functions etc
}
```

If you were to do this without SubscriptionManager,  you might do it like this:
```typescript
export class ExampleFormDefaultComponent implements OnDestroy {

  form: FormGroup;
  subs = new Subscription();
  changeCount = 0;
  private hasChangedSurname: boolean;

  constructor(private builder: FormBuilder) {
    this.form = this.builder.group({
      firstName: new FormControl(),
      surname: new FormControl(),
      age: new FormControl()
    });

    this.subs.add(
      this.form.controls.firstName.valueChanges
        .subscribe(
          (change) => this.onNameChange(change)));
    this.subs.add(
      this.form.controls.surname.valueChanges
        // The pipe
        .pipe(takeWhile(() => !this.hasChangedSurname))
        .subscribe((change) => this.onSurnameChange(change)));

    this.subs.add(
      this.form.controls.age.valueChanges
        .subscribe(
          (change) => this.onAgeChange(change)));
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  private onSurnameChange(change: any) {
    // Then change some condition or something
    this.hasChangedSurname = true;
    // Logic
  }
}
```

Now the difference here, is that you have to store the subscriptions etc into a variable in order to individually unsubscribe.
With the subscription manager, you can set an id in the options and use unsubscribeById('surname').

There is also not less repeatable code hopefully.
You don't need to do valueChanges.subscribe, and you don't need to add a pipe and takeWhile/Until and all that, if you
 just want the subscription to terminate upon the first event.


You can also get subscription manager to return the list or map of the subscriptions with ``.getMap()`` or ``.getList()``.

If you want, you can also do add the ``.pipe(takeWhile(...logic...))`` if you want.
