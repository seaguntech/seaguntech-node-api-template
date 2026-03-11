import { Injectable } from '@nestjs/common';
import { context, trace } from '@opentelemetry/api';

@Injectable()
export class TracingService {
  getCurrentTraceId(): string | undefined {
    const activeSpan = trace.getSpan(context.active());
    return activeSpan?.spanContext().traceId;
  }
}
