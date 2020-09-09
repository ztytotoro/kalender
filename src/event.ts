import {
    CalendarRepeatTypes,
    TimeUnits,
    CalendarDuration,
    DurationTypes,
    CalendarRepeat,
    TimeSpan,
} from './core';
import {
    isWorkDay,
    isWeekend,
    getWeekDay,
    getMonthDay,
    getMonth,
    isDefined,
    toPositiveInt,
    isEqual,
    isRepeated,
} from './helpers';
import { isNumber } from './type';

export class CalendarEvent {
    #id = Symbol();
    #start: Date;
    #end?: Date;
    #duration?: CalendarDuration;
    #repeat?: CalendarRepeat;
    #title?: string;
    #description?: string;

    get id() {
        return this.#id;
    }

    get start() {
        return this.#start;
    }

    get end() {
        return this.#end;
    }

    get duration() {
        return this.#duration;
    }

    get repeat() {
        return this.#repeat;
    }

    get title() {
        return this.#title;
    }

    get description() {
        return this.#description;
    }

    constructor(start: Date) {
        this.#start = start;
    }

    startWhen(date: Date) {
        this.#start = date;
    }

    endWhen(date: Date) {
        this.#end = date;
        return this;
    }

    repeatEvery(
        count: number,
        duration: CalendarRepeatTypes,
        times?: number
    ): this;
    repeatEvery(duration: CalendarRepeatTypes, times?: number): this;
    repeatEvery(
        a: number | CalendarRepeatTypes,
        b?: CalendarRepeatTypes | number,
        c?: number
    ) {
        if (isNumber(a) && isDefined<CalendarRepeatTypes>(b)) {
            this.#repeat = {
                value: toPositiveInt(a),
                type: b,
                times: isNumber(c) ? c : -1,
            };
        } else if (isDefined<CalendarRepeatTypes>(a)) {
            this.#repeat = {
                value: 1,
                type: a,
                times: isNumber(c) ? c : -1,
            };
        } else {
            throw new Error('Unsupported arguments');
        }

        return this;
    }

    last(value: number, type: DurationTypes) {
        this.#duration = {
            value: toPositiveInt(value),
            type,
        };
        return this;
    }

    setTitle(text: string) {
        this.#title = text;
        return this;
    }

    setDescription(text: string) {
        this.#description = text;
    }
}

export function isEventMatch(
    date: Date,
    eventStart: Date,
    repeat: CalendarRepeat
) {
    const span = new TimeSpan(eventStart, date, true);
    switch (repeat.type) {
        case TimeUnits.Day: {
            if (repeat.times === -1) {
                return span.getDays() % repeat.value === 0;
            } else {
                return isEqual(span.getDays() / repeat.value, repeat.times);
            }
        }
        case TimeUnits.WorkDay:
            return (
                isWorkDay(date) && isRepeated(span, TimeUnits.Day, repeat.times)
            );
        case TimeUnits.Weekend:
            return (
                isWeekend(date) && isRepeated(span, TimeUnits.Day, repeat.times)
            );
        case TimeUnits.Week:
        case TimeUnits.Month:
        case TimeUnits.Year:
            return isRepeated(span, repeat.type, repeat.times);
        default:
            return false;
    }
}

export function createEvent(start: Date) {
    return new CalendarEvent(start);
}

export class EventSets {
    #eventMap = new Map<Symbol, CalendarEvent>();

    add(event: CalendarEvent) {
        if (!this.#eventMap.has(event.id)) {
            this.#eventMap.set(event.id, event);
        }
    }

    get events() {
        return Array.from(this.#eventMap.values());
    }
}

type EventOption = (
    | Pick<CalendarEvent, 'start'>
    | Pick<CalendarEvent, 'start' | 'end'>
    | Pick<CalendarEvent, 'start' | 'duration'>
) &
    Partial<Pick<CalendarEvent, 'title' | 'description'>>;

export function createEvents(options: EventOption[]) {}
