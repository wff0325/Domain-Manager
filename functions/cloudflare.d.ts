declare global {
    interface ResponseConstructor {
        json(data: any, init?: ResponseInit): Response;
    }

    interface PagesFunction<Env = unknown> {
        (context: EventContext<Env, string, unknown>): Promise<Response> | Response;
    }

    interface EventContext<Env, P extends string, Data> {
        request: Request;
        env: Env;
        params: Record<P, string>;
        data: Data;
        next(): Promise<Response>;
    }
}

export { } 