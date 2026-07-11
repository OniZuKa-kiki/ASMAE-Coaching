import * as Sentry from "@sentry/nextjs";
import { getSentryInitOptions } from "./src/lib/sentry-init";

Sentry.init(getSentryInitOptions());
