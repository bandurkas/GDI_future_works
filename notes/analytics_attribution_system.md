# Architectural Decision: Unified Growth & Analytics System

## Context
As of April 2026, GDI FutureWorks was experiencing "data blindness" (0 recorded leads in GA4) and high "Direct" traffic attribution (76%). The goal was to implement a robust, unified tracking system that persists marketing attribution (UTM) across the entire user journey.

## Decisions
1. **UTM Persistence:** We implemented a `UTMTracker` using `localStorage` with a 30-day expiry. Parameters (`utm_source`, `utm_medium`, `utm_campaign`, etc.) are captured on first entry and persisted until conversion or expiry.
2. **Unified Tracking API:** Created `lib/analytics.ts` which provides a `trackConversion` function. This function sends consistent events to both GA4 (`generate_lead`) and Meta Pixel (`Lead`) simultaneously. 
3. **CRM Integration:** Updated Prisma models (`Student`, `Lead`, `TutorApplication`) to include UTM fields. The `tutor-apply` API now extracts UTMs from the request payload and persists them to the DB.
4. **Traffic Filtering:** Implemented `TrackingInitializer` to exclude the `/admin` and `/crm` paths from GA4/Pixel tracking to prevent operational traffic from polluting marketing data.
5. **Funnel Measurement:** Added step-level event tracking to the tutor application form (`tutor_application_step_complete`) to analyze drop-off points.

## Consequences
- Every lead in the admin panel now has an attribution "passport".
- Marketing spend can now be optimized based on actual conversion data.
- The site now adheres to state-of-the-art Growth Engineering practices.
