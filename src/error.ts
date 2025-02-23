import {SourceLocation} from './location';

export class JsonError extends Error {
    public constructor(message: string) {
        super(message);

        Object.setPrototypeOf(this, new.target.prototype);
    }
}

export class JsonParseError extends JsonError {
    public readonly location: SourceLocation;

    public constructor(message: string, location: SourceLocation) {
        super(message);

        this.location = location;

        Object.setPrototypeOf(this, new.target.prototype);
    }
}
