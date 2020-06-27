import {SubscriptionManager} from "./subscription-manager";
import {Subject} from "rxjs";

describe('SubscriptionManager', () => {
    let sm: SubscriptionManager,
        callback, subject: Subject<any>;

    beforeEach(() => {
        sm = new SubscriptionManager();

        callback = jest.fn();
        subject = new Subject();
    });

    describe('Without ID', () => {
        beforeEach(() => {
            sm.add(subject, () => callback());
        });

        it('Can add a new subscription', async () => {
            expect(sm.getList().length).toBe(1);
        });

        it('Does run the callback provided', () => {
            expect(callback).toHaveBeenCalledTimes(0);
            subject.next(100);
            expect(callback).toHaveBeenCalledTimes(1);
            subject.next(300);
            expect(callback).toHaveBeenCalledTimes(2);
        });

        it('Can unsubscribe and remove all subscriptions', () => {
            const subject2 = new Subject();
            const func = jest.fn();
            sm.add(subject2, func);
            expect(sm.getList().length).toBe(2);
            subject.next(99);
            sm.unsubscribe();
            expect(sm.getList().length).toBe(0);
            expect(sm.getMap().size).toBe(0);
            subject2.next(123);
            subject.next(99);
            expect(callback).toHaveBeenCalledTimes(1);
            expect(func).toHaveBeenCalledTimes(0);
        });

        it('Can unsubscribe upon first event', () => {
            const func = jest.fn();
            sm.add(subject, func, {
                terminateUponEvent: true
            });

            expect(sm.getList().length).toBe(2);
            subject.next(99);
            subject.next(99);
            subject.next(99);
            expect(func).toHaveBeenCalledTimes(1);
            expect(sm.getList().length).toBe(1);
        });
    })

    describe('With ID', () => {
        const id = 'tag';
        beforeEach(() => {
            sm.add(subject,
                () => callback(),
                {
                    id
                });
        });

        it('Can get a subscription by id', () => {
            expect(sm.getById(id)).toBeTruthy();
        });

        it('Can unsubscribe by id', () => {
            expect(sm.getList().length).toBe(1);
            sm.unsubscribeById(id);
            expect(sm.getById(id)).toBeFalsy();
            expect(sm.getList().length).toBe(0);
        });

        it('Can unsubscribe upon first event', () => {
            const func = jest.fn();
            sm.addSingleEvent(subject, func, {
                id
            });

            subject.next(99);
            subject.next(99);
            subject.next(99);
            expect(func).toHaveBeenCalledTimes(1);
            expect(sm.getById(id)).toBeFalsy();
            expect(sm.getList().length).toBe(1);
        });
    });
});