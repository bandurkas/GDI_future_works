--
-- PostgreSQL database dump
--

\restrict mWkPahYPSApkY6LLVaezTShbjthgfBRzs8ttfiTU9tQ5gL7n4bkkwycpWDtlO4U

-- Dumped from database version 16.13 (Ubuntu 16.13-0ubuntu0.24.04.1)
-- Dumped by pg_dump version 16.13 (Ubuntu 16.13-0ubuntu0.24.04.1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: gdiuser
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO gdiuser;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: gdiuser
--

COMMENT ON SCHEMA public IS '';


--
-- Name: ActivityType; Type: TYPE; Schema: public; Owner: gdiuser
--

CREATE TYPE public."ActivityType" AS ENUM (
    'CALL',
    'WHATSAPP',
    'EMAIL'
);


ALTER TYPE public."ActivityType" OWNER TO gdiuser;

--
-- Name: ApplicationStatus; Type: TYPE; Schema: public; Owner: gdiuser
--

CREATE TYPE public."ApplicationStatus" AS ENUM (
    'PENDING',
    'APPROVED',
    'REJECTED'
);


ALTER TYPE public."ApplicationStatus" OWNER TO gdiuser;

--
-- Name: BookingStatus; Type: TYPE; Schema: public; Owner: gdiuser
--

CREATE TYPE public."BookingStatus" AS ENUM (
    'BOOKED',
    'ATTENDED',
    'MISSED',
    'CANCELLED'
);


ALTER TYPE public."BookingStatus" OWNER TO gdiuser;

--
-- Name: CourseLevel; Type: TYPE; Schema: public; Owner: gdiuser
--

CREATE TYPE public."CourseLevel" AS ENUM (
    'BEGINNER',
    'INTERMEDIATE',
    'ADVANCED'
);


ALTER TYPE public."CourseLevel" OWNER TO gdiuser;

--
-- Name: LeadStatus; Type: TYPE; Schema: public; Owner: gdiuser
--

CREATE TYPE public."LeadStatus" AS ENUM (
    'NEW',
    'CONTACTED',
    'QUALIFIED',
    'CONVERTED'
);


ALTER TYPE public."LeadStatus" OWNER TO gdiuser;

--
-- Name: LeadType; Type: TYPE; Schema: public; Owner: gdiuser
--

CREATE TYPE public."LeadType" AS ENUM (
    'STUDENT',
    'TUTOR'
);


ALTER TYPE public."LeadType" OWNER TO gdiuser;

--
-- Name: NotificationType; Type: TYPE; Schema: public; Owner: gdiuser
--

CREATE TYPE public."NotificationType" AS ENUM (
    'BOOKING',
    'PAYMENT',
    'REMINDER'
);


ALTER TYPE public."NotificationType" OWNER TO gdiuser;

--
-- Name: PaymentProvider; Type: TYPE; Schema: public; Owner: gdiuser
--

CREATE TYPE public."PaymentProvider" AS ENUM (
    'MIDTRANS',
    'STRIPE'
);


ALTER TYPE public."PaymentProvider" OWNER TO gdiuser;

--
-- Name: PaymentStatus; Type: TYPE; Schema: public; Owner: gdiuser
--

CREATE TYPE public."PaymentStatus" AS ENUM (
    'PENDING',
    'PAID',
    'FAILED',
    'REFUNDED'
);


ALTER TYPE public."PaymentStatus" OWNER TO gdiuser;

--
-- Name: PayoutStatus; Type: TYPE; Schema: public; Owner: gdiuser
--

CREATE TYPE public."PayoutStatus" AS ENUM (
    'PENDING',
    'PAID'
);


ALTER TYPE public."PayoutStatus" OWNER TO gdiuser;

--
-- Name: ProgramCategory; Type: TYPE; Schema: public; Owner: gdiuser
--

CREATE TYPE public."ProgramCategory" AS ENUM (
    'AI',
    'DATA',
    'CODING',
    'TEFL'
);


ALTER TYPE public."ProgramCategory" OWNER TO gdiuser;

--
-- Name: SessionStatus; Type: TYPE; Schema: public; Owner: gdiuser
--

CREATE TYPE public."SessionStatus" AS ENUM (
    'SCHEDULED',
    'COMPLETED',
    'CANCELLED'
);


ALTER TYPE public."SessionStatus" OWNER TO gdiuser;

--
-- Name: StudentStatus; Type: TYPE; Schema: public; Owner: gdiuser
--

CREATE TYPE public."StudentStatus" AS ENUM (
    'LEAD',
    'ACTIVE',
    'COMPLETED',
    'DROPPED'
);


ALTER TYPE public."StudentStatus" OWNER TO gdiuser;

--
-- Name: TutorStatus; Type: TYPE; Schema: public; Owner: gdiuser
--

CREATE TYPE public."TutorStatus" AS ENUM (
    'PENDING',
    'APPROVED',
    'REJECTED'
);


ALTER TYPE public."TutorStatus" OWNER TO gdiuser;

--
-- Name: UserRole; Type: TYPE; Schema: public; Owner: gdiuser
--

CREATE TYPE public."UserRole" AS ENUM (
    'STUDENT',
    'TUTOR',
    'ADMIN',
    'Owner',
    'SalesManager',
    'Instructor',
    'Support'
);


ALTER TYPE public."UserRole" OWNER TO gdiuser;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: Booking; Type: TABLE; Schema: public; Owner: gdiuser
--

CREATE TABLE public."Booking" (
    id text NOT NULL,
    "sessionId" text NOT NULL,
    "studentId" text NOT NULL,
    status public."BookingStatus" DEFAULT 'BOOKED'::public."BookingStatus" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "deletedAt" timestamp(3) without time zone
);


ALTER TABLE public."Booking" OWNER TO gdiuser;

--
-- Name: Course; Type: TABLE; Schema: public; Owner: gdiuser
--

CREATE TABLE public."Course" (
    id text NOT NULL,
    "programId" text NOT NULL,
    "tutorId" text NOT NULL,
    title text NOT NULL,
    description text,
    "durationWeeks" integer NOT NULL,
    level public."CourseLevel" NOT NULL,
    "isPublished" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "deletedAt" timestamp(3) without time zone
);


ALTER TABLE public."Course" OWNER TO gdiuser;

--
-- Name: CourseModule; Type: TABLE; Schema: public; Owner: gdiuser
--

CREATE TABLE public."CourseModule" (
    id text NOT NULL,
    "courseId" text NOT NULL,
    title text NOT NULL,
    "orderIndex" integer NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."CourseModule" OWNER TO gdiuser;

--
-- Name: CoursePrice; Type: TABLE; Schema: public; Owner: gdiuser
--

CREATE TABLE public."CoursePrice" (
    id text NOT NULL,
    "courseId" text NOT NULL,
    currency text NOT NULL,
    amount numeric(10,2) NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."CoursePrice" OWNER TO gdiuser;

--
-- Name: Lead; Type: TABLE; Schema: public; Owner: gdiuser
--

CREATE TABLE public."Lead" (
    id text NOT NULL,
    type public."LeadType" NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    phone text,
    source text,
    status public."LeadStatus" DEFAULT 'NEW'::public."LeadStatus" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "deletedAt" timestamp(3) without time zone
);


ALTER TABLE public."Lead" OWNER TO gdiuser;

--
-- Name: LeadActivity; Type: TABLE; Schema: public; Owner: gdiuser
--

CREATE TABLE public."LeadActivity" (
    id text NOT NULL,
    "leadId" text NOT NULL,
    type public."ActivityType" NOT NULL,
    notes text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."LeadActivity" OWNER TO gdiuser;

--
-- Name: Lesson; Type: TABLE; Schema: public; Owner: gdiuser
--

CREATE TABLE public."Lesson" (
    id text NOT NULL,
    "moduleId" text NOT NULL,
    title text NOT NULL,
    description text,
    "durationMinutes" integer NOT NULL,
    "orderIndex" integer DEFAULT 1 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Lesson" OWNER TO gdiuser;

--
-- Name: Notification; Type: TABLE; Schema: public; Owner: gdiuser
--

CREATE TABLE public."Notification" (
    id text NOT NULL,
    "userId" text NOT NULL,
    type public."NotificationType" NOT NULL,
    title text NOT NULL,
    message text NOT NULL,
    "isRead" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."Notification" OWNER TO gdiuser;

--
-- Name: Payment; Type: TABLE; Schema: public; Owner: gdiuser
--

CREATE TABLE public."Payment" (
    id text NOT NULL,
    "studentId" text NOT NULL,
    "bookingId" text,
    amount numeric(10,2) NOT NULL,
    currency text DEFAULT 'IDR'::text NOT NULL,
    status public."PaymentStatus" DEFAULT 'PENDING'::public."PaymentStatus" NOT NULL,
    provider public."PaymentProvider" NOT NULL,
    "externalId" text,
    "transactionId" text,
    metadata jsonb,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Payment" OWNER TO gdiuser;

--
-- Name: Program; Type: TABLE; Schema: public; Owner: gdiuser
--

CREATE TABLE public."Program" (
    id text NOT NULL,
    title text NOT NULL,
    slug text NOT NULL,
    description text,
    category public."ProgramCategory" NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "deletedAt" timestamp(3) without time zone
);


ALTER TABLE public."Program" OWNER TO gdiuser;

--
-- Name: Review; Type: TABLE; Schema: public; Owner: gdiuser
--

CREATE TABLE public."Review" (
    id text NOT NULL,
    "studentId" text NOT NULL,
    "tutorId" text NOT NULL,
    "courseId" text NOT NULL,
    rating integer NOT NULL,
    comment text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Review" OWNER TO gdiuser;

--
-- Name: Session; Type: TABLE; Schema: public; Owner: gdiuser
--

CREATE TABLE public."Session" (
    id text NOT NULL,
    "courseId" text NOT NULL,
    "startTime" timestamp(3) without time zone NOT NULL,
    "endTime" timestamp(3) without time zone NOT NULL,
    status public."SessionStatus" DEFAULT 'SCHEDULED'::public."SessionStatus" NOT NULL,
    "meetingUrl" text,
    capacity integer DEFAULT 1 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "deletedAt" timestamp(3) without time zone
);


ALTER TABLE public."Session" OWNER TO gdiuser;

--
-- Name: Student; Type: TABLE; Schema: public; Owner: gdiuser
--

CREATE TABLE public."Student" (
    id text NOT NULL,
    "userId" text NOT NULL,
    status public."StudentStatus" DEFAULT 'LEAD'::public."StudentStatus" NOT NULL,
    country text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "deletedAt" timestamp(3) without time zone
);


ALTER TABLE public."Student" OWNER TO gdiuser;

--
-- Name: Tutor; Type: TABLE; Schema: public; Owner: gdiuser
--

CREATE TABLE public."Tutor" (
    id text NOT NULL,
    "userId" text NOT NULL,
    bio text,
    expertise text[],
    "ratingAvg" double precision DEFAULT 0 NOT NULL,
    "totalReviews" integer DEFAULT 0 NOT NULL,
    "isVerified" boolean DEFAULT false NOT NULL,
    status public."TutorStatus" DEFAULT 'PENDING'::public."TutorStatus" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "deletedAt" timestamp(3) without time zone
);


ALTER TABLE public."Tutor" OWNER TO gdiuser;

--
-- Name: TutorApplication; Type: TABLE; Schema: public; Owner: gdiuser
--

CREATE TABLE public."TutorApplication" (
    id text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    linkedin text,
    bio text,
    expertise text NOT NULL,
    "videoLink" text NOT NULL,
    "portfolioLink" text,
    curriculum text,
    "lessonPlan" text,
    status public."ApplicationStatus" DEFAULT 'PENDING'::public."ApplicationStatus" NOT NULL
);


ALTER TABLE public."TutorApplication" OWNER TO gdiuser;

--
-- Name: TutorAvailability; Type: TABLE; Schema: public; Owner: gdiuser
--

CREATE TABLE public."TutorAvailability" (
    id text NOT NULL,
    "tutorId" text NOT NULL,
    "dayOfWeek" integer NOT NULL,
    "startTimeM" integer NOT NULL,
    "endTimeM" integer NOT NULL,
    timezone text DEFAULT 'UTC'::text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."TutorAvailability" OWNER TO gdiuser;

--
-- Name: TutorPayout; Type: TABLE; Schema: public; Owner: gdiuser
--

CREATE TABLE public."TutorPayout" (
    id text NOT NULL,
    "tutorId" text NOT NULL,
    amount numeric(10,2) NOT NULL,
    status public."PayoutStatus" DEFAULT 'PENDING'::public."PayoutStatus" NOT NULL,
    "periodStart" timestamp(3) without time zone NOT NULL,
    "periodEnd" timestamp(3) without time zone NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."TutorPayout" OWNER TO gdiuser;

--
-- Name: TutorProfile; Type: TABLE; Schema: public; Owner: gdiuser
--

CREATE TABLE public."TutorProfile" (
    id text NOT NULL,
    "tutorId" text NOT NULL,
    headline text,
    "introVideoUrl" text,
    "hourlyRate" numeric(10,2),
    languages text[],
    "experienceYears" integer,
    "portfolioUrl" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."TutorProfile" OWNER TO gdiuser;

--
-- Name: User; Type: TABLE; Schema: public; Owner: gdiuser
--

CREATE TABLE public."User" (
    id text NOT NULL,
    name text,
    email text NOT NULL,
    phone text,
    "passwordHash" text,
    role public."UserRole" NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "avatarUrl" text,
    "lastLogin" timestamp(3) without time zone,
    permissions jsonb DEFAULT '{}'::jsonb,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "deletedAt" timestamp(3) without time zone
);


ALTER TABLE public."User" OWNER TO gdiuser;

--
-- Data for Name: Booking; Type: TABLE DATA; Schema: public; Owner: gdiuser
--

COPY public."Booking" (id, "sessionId", "studentId", status, "createdAt", "updatedAt", "deletedAt") FROM stdin;
\.


--
-- Data for Name: Course; Type: TABLE DATA; Schema: public; Owner: gdiuser
--

COPY public."Course" (id, "programId", "tutorId", title, description, "durationWeeks", level, "isPublished", "createdAt", "updatedAt", "deletedAt") FROM stdin;
data-analytics	8c789279-88d3-4ab8-884d-482a9dba842d	aff11759-cafc-400f-8adf-a6e3b50a4c03	Basic Data Analyst	\N	4	BEGINNER	f	2026-03-21 11:23:59.193	2026-03-21 11:23:59.193	\N
python-programming	ca909e80-6345-4e3a-9b96-281da6ae1de8	aff11759-cafc-400f-8adf-a6e3b50a4c03	Python for Professionals	\N	4	BEGINNER	f	2026-03-21 11:23:59.199	2026-03-21 11:23:59.199	\N
graphic-design-ai	14eb0f63-7026-43cb-a883-00a9321733c4	aff11759-cafc-400f-8adf-a6e3b50a4c03	Graphic Design with AI	\N	4	BEGINNER	f	2026-03-21 11:23:59.201	2026-03-21 11:23:59.201	\N
llm-ai-engineering	f9d8c1b8-e1b6-48f4-9194-053f41747ceb	aff11759-cafc-400f-8adf-a6e3b50a4c03	LLM & AI Engineering	\N	4	ADVANCED	f	2026-03-21 11:23:59.203	2026-03-21 11:23:59.203	\N
\.


--
-- Data for Name: CourseModule; Type: TABLE DATA; Schema: public; Owner: gdiuser
--

COPY public."CourseModule" (id, "courseId", title, "orderIndex", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: CoursePrice; Type: TABLE DATA; Schema: public; Owner: gdiuser
--

COPY public."CoursePrice" (id, "courseId", currency, amount, "createdAt", "updatedAt") FROM stdin;
d8436693-0deb-4ae4-9dee-c5d3bb657298	data-analytics	IDR	400000.00	2026-03-21 11:23:59.193	2026-03-21 11:23:59.193
fde884ee-6a92-4010-b1d8-4e22bb36720e	data-analytics	MYR	93.00	2026-03-21 11:23:59.193	2026-03-21 11:23:59.193
4450089d-d921-43f4-a5fd-d0153254d668	python-programming	IDR	400000.00	2026-03-21 11:23:59.199	2026-03-21 11:23:59.199
e68b4444-d7ad-4a9f-9f7e-6072ce769998	python-programming	MYR	93.00	2026-03-21 11:23:59.199	2026-03-21 11:23:59.199
2ba0f036-154f-44d1-98ef-e50b001559a8	graphic-design-ai	IDR	400000.00	2026-03-21 11:23:59.201	2026-03-21 11:23:59.201
9addcb9c-0388-489a-b4c5-d395d8b3b0f6	graphic-design-ai	MYR	93.00	2026-03-21 11:23:59.201	2026-03-21 11:23:59.201
7336d193-f6a1-4a2f-804a-2d21f01457f9	llm-ai-engineering	IDR	400000.00	2026-03-21 11:23:59.203	2026-03-21 11:23:59.203
77f33074-3373-427a-a7f6-dcb50e34d334	llm-ai-engineering	MYR	93.00	2026-03-21 11:23:59.203	2026-03-21 11:23:59.203
\.


--
-- Data for Name: Lead; Type: TABLE DATA; Schema: public; Owner: gdiuser
--

COPY public."Lead" (id, type, name, email, phone, source, status, "createdAt", "updatedAt", "deletedAt") FROM stdin;
\.


--
-- Data for Name: LeadActivity; Type: TABLE DATA; Schema: public; Owner: gdiuser
--

COPY public."LeadActivity" (id, "leadId", type, notes, "createdAt") FROM stdin;
\.


--
-- Data for Name: Lesson; Type: TABLE DATA; Schema: public; Owner: gdiuser
--

COPY public."Lesson" (id, "moduleId", title, description, "durationMinutes", "orderIndex", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Notification; Type: TABLE DATA; Schema: public; Owner: gdiuser
--

COPY public."Notification" (id, "userId", type, title, message, "isRead", "createdAt") FROM stdin;
\.


--
-- Data for Name: Payment; Type: TABLE DATA; Schema: public; Owner: gdiuser
--

COPY public."Payment" (id, "studentId", "bookingId", amount, currency, status, provider, "externalId", "transactionId", metadata, "createdAt", "updatedAt") FROM stdin;
23b4211e-23c8-424a-90be-27465c53688a	790bd02c-d5fe-4528-b53e-bafdb33c8663	\N	310341.00	IDR	PENDING	MIDTRANS	GDI-MYR-python-programming-1774092330585	\N	{"items": [{"id": "python-programming-s3", "name": "RM 93 Python for Professionals", "price": 310341, "quantity": 1}], "userAmount": 93, "userCurrency": "MYR", "conversionRate": 3337}	2026-03-21 11:25:30.593	2026-03-21 11:25:30.593
e7341018-a39d-4c3a-9278-e17e8f6e7e28	790bd02c-d5fe-4528-b53e-bafdb33c8663	\N	310341.00	IDR	PENDING	MIDTRANS	GDI-MYR-graphic-design-ai-1774097108296	\N	{"items": [{"id": "graphic-design-ai-s4", "name": "RM 93 Graphic Design with AI", "price": 310341, "quantity": 1}], "userAmount": 93, "userCurrency": "MYR", "conversionRate": 3337}	2026-03-21 12:45:08.302	2026-03-21 12:45:08.302
33372e11-a6a8-4072-8102-34f4f7d93bba	4c4681f1-10c1-46fa-bbfb-df37f822e4df	\N	400000.00	IDR	PENDING	MIDTRANS	GDI-IDR-data-analytics-1774158400788	\N	{"items": [{"id": "data-analytics-s4", "name": "Basic Data Analyst", "price": 400000, "quantity": 1}], "userAmount": 400000, "userCurrency": "IDR", "conversionRate": 1}	2026-03-22 05:46:40.795	2026-03-22 05:46:40.795
0cc90644-007f-44b1-8afa-983631f4dc1e	42a64568-f98a-4070-b0a8-bf3c82a2af61	\N	310341.00	IDR	PENDING	MIDTRANS	GDI-MYR-data-analytics-1774164438491	\N	{"items": [{"id": "data-analytics-s2", "name": "RM 93 Basic Data Analyst", "price": 310341, "quantity": 1}], "userAmount": 93, "userCurrency": "MYR", "conversionRate": 3337}	2026-03-22 07:27:18.499	2026-03-22 07:27:18.499
e392a4d0-ed05-425a-9799-f95465e64569	790bd02c-d5fe-4528-b53e-bafdb33c8663	\N	400000.00	IDR	PENDING	MIDTRANS	GDI-IDR-data-analytics-1774173594034	\N	{"items": [{"id": "data-analytics-s3", "name": "Basic Data Analyst", "price": 400000, "quantity": 1}], "userAmount": 400000, "userCurrency": "IDR", "conversionRate": 1}	2026-03-22 09:59:54.04	2026-03-22 09:59:54.04
\.


--
-- Data for Name: Program; Type: TABLE DATA; Schema: public; Owner: gdiuser
--

COPY public."Program" (id, title, slug, description, category, "isActive", "createdAt", "updatedAt", "deletedAt") FROM stdin;
8c789279-88d3-4ab8-884d-482a9dba842d	Data Analytics	data-analytics	\N	DATA	t	2026-03-21 11:23:59.184	2026-03-21 11:23:59.184	\N
ca909e80-6345-4e3a-9b96-281da6ae1de8	Python Programming	python-programming	\N	CODING	t	2026-03-21 11:23:59.186	2026-03-21 11:23:59.186	\N
14eb0f63-7026-43cb-a883-00a9321733c4	Graphic Design & AI	graphic-design-ai	\N	AI	t	2026-03-21 11:23:59.188	2026-03-21 11:23:59.188	\N
f9d8c1b8-e1b6-48f4-9194-053f41747ceb	LLM & AI Engineering	llm-ai-engineering	\N	AI	t	2026-03-21 11:23:59.19	2026-03-21 11:23:59.19	\N
\.


--
-- Data for Name: Review; Type: TABLE DATA; Schema: public; Owner: gdiuser
--

COPY public."Review" (id, "studentId", "tutorId", "courseId", rating, comment, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Session; Type: TABLE DATA; Schema: public; Owner: gdiuser
--

COPY public."Session" (id, "courseId", "startTime", "endTime", status, "meetingUrl", capacity, "createdAt", "updatedAt", "deletedAt") FROM stdin;
\.


--
-- Data for Name: Student; Type: TABLE DATA; Schema: public; Owner: gdiuser
--

COPY public."Student" (id, "userId", status, country, "createdAt", "updatedAt", "deletedAt") FROM stdin;
790bd02c-d5fe-4528-b53e-bafdb33c8663	32128ad1-09db-427d-b314-3fa6c2d6afe3	LEAD	\N	2026-03-21 11:25:30.59	2026-03-21 11:25:30.59	\N
4c4681f1-10c1-46fa-bbfb-df37f822e4df	cb13af70-4bd6-41f3-b1c3-9709a6d60969	LEAD	\N	2026-03-22 05:46:40.793	2026-03-22 05:46:40.793	\N
34b26cf3-5c8d-458f-8055-97b1f24b06bf	40357df8-cf5e-45ef-bda6-436cc9b6e651	ACTIVE	\N	2026-03-22 06:51:51.527	2026-03-22 06:51:51.527	\N
2577f2ac-7e0f-4201-9b53-3bdc011b9663	9864cf3a-988f-4ab4-b39f-731d950daaf1	ACTIVE	\N	2026-03-22 06:53:15.013	2026-03-22 06:53:15.013	\N
42a64568-f98a-4070-b0a8-bf3c82a2af61	7cca258f-5287-457d-b0f8-d3d930bc117b	LEAD	\N	2026-03-22 07:27:18.496	2026-03-22 07:27:18.496	\N
\.


--
-- Data for Name: Tutor; Type: TABLE DATA; Schema: public; Owner: gdiuser
--

COPY public."Tutor" (id, "userId", bio, expertise, "ratingAvg", "totalReviews", "isVerified", status, "createdAt", "updatedAt", "deletedAt") FROM stdin;
aff11759-cafc-400f-8adf-a6e3b50a4c03	c9b38541-c388-4d27-8aed-32411f0cd6fd	\N	{Data,Python,AI}	0	0	f	APPROVED	2026-03-21 11:23:59.181	2026-03-21 11:23:59.181	\N
\.


--
-- Data for Name: TutorApplication; Type: TABLE DATA; Schema: public; Owner: gdiuser
--

COPY public."TutorApplication" (id, "createdAt", name, email, linkedin, bio, expertise, "videoLink", "portfolioLink", curriculum, "lessonPlan", status) FROM stdin;
\.


--
-- Data for Name: TutorAvailability; Type: TABLE DATA; Schema: public; Owner: gdiuser
--

COPY public."TutorAvailability" (id, "tutorId", "dayOfWeek", "startTimeM", "endTimeM", timezone, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: TutorPayout; Type: TABLE DATA; Schema: public; Owner: gdiuser
--

COPY public."TutorPayout" (id, "tutorId", amount, status, "periodStart", "periodEnd", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: TutorProfile; Type: TABLE DATA; Schema: public; Owner: gdiuser
--

COPY public."TutorProfile" (id, "tutorId", headline, "introVideoUrl", "hourlyRate", languages, "experienceYears", "portfolioUrl", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: gdiuser
--

COPY public."User" (id, name, email, phone, "passwordHash", role, "isActive", "avatarUrl", "lastLogin", permissions, "createdAt", "updatedAt", "deletedAt") FROM stdin;
89802883-d387-4454-9ace-e437df1710f1	GDI Admin	admin@gdifutureworks.com	\N	\N	ADMIN	t	\N	\N	{}	2026-03-21 11:23:59.169	2026-03-21 11:23:59.169	\N
c9b38541-c388-4d27-8aed-32411f0cd6fd	Expert Instructor	instructor@gdifutureworks.com	\N	\N	TUTOR	t	\N	\N	{}	2026-03-21 11:23:59.179	2026-03-21 11:23:59.179	\N
32128ad1-09db-427d-b314-3fa6c2d6afe3	Sergey Bandurka	badurkas@gmail.com	\N	\N	STUDENT	t	\N	\N	{}	2026-03-21 11:25:30.587	2026-03-21 11:25:30.587	\N
a461e4ac-f303-4965-a063-9fe19b136e12	GDI Admin	admin@gdifuture.works	\N	$2b$10$CDSQIfGvhE3CHiovd8mqL.qCgbfsT5xMWVhTavJW/yA0oAnvvsG3W	ADMIN	t	\N	\N	{}	2026-03-22 05:07:20.969	2026-03-22 05:07:20.969	\N
cb13af70-4bd6-41f3-b1c3-9709a6d60969	Sergey Bandurka	badurkassss@gmail.com	\N	\N	STUDENT	t	\N	\N	{}	2026-03-22 05:46:40.789	2026-03-22 05:46:40.789	\N
40357df8-cf5e-45ef-bda6-436cc9b6e651	Nane Guru	bandurkas@gmail.com	\N	$2b$10$CDSQIfGvhE3CHiovd8mqL.qCgbfsT5xMWVhTavJW/yA0oAnvvsG3W	ADMIN	t	https://lh3.googleusercontent.com/a/ACg8ocL3aKf_p-owF6JuDb77WXbNh_oFwFt0a6ifgP3VBYo47RFZqQ=s96-c	2026-03-22 06:51:51.49	{}	2026-03-22 05:07:20.976	2026-03-22 06:51:51.52	\N
9864cf3a-988f-4ab4-b39f-731d950daaf1	Sergey B	bandurkass@gmail.com	\N	\N	STUDENT	t	https://lh3.googleusercontent.com/a/ACg8ocLIv9Zr5f1NmxWWqHbY11CpLpKK0eD1HBsRK04YAx0tE1xySA=s96-c	2026-03-22 07:26:33.24	{}	2026-03-22 06:53:15.006	2026-03-22 07:26:33.269	\N
7cca258f-5287-457d-b0f8-d3d930bc117b	Student	badurkasee@gmail.com	\N	\N	STUDENT	t	\N	\N	{}	2026-03-22 07:27:18.492	2026-03-22 07:27:18.492	\N
\.


--
-- Name: Booking Booking_pkey; Type: CONSTRAINT; Schema: public; Owner: gdiuser
--

ALTER TABLE ONLY public."Booking"
    ADD CONSTRAINT "Booking_pkey" PRIMARY KEY (id);


--
-- Name: CourseModule CourseModule_pkey; Type: CONSTRAINT; Schema: public; Owner: gdiuser
--

ALTER TABLE ONLY public."CourseModule"
    ADD CONSTRAINT "CourseModule_pkey" PRIMARY KEY (id);


--
-- Name: CoursePrice CoursePrice_pkey; Type: CONSTRAINT; Schema: public; Owner: gdiuser
--

ALTER TABLE ONLY public."CoursePrice"
    ADD CONSTRAINT "CoursePrice_pkey" PRIMARY KEY (id);


--
-- Name: Course Course_pkey; Type: CONSTRAINT; Schema: public; Owner: gdiuser
--

ALTER TABLE ONLY public."Course"
    ADD CONSTRAINT "Course_pkey" PRIMARY KEY (id);


--
-- Name: LeadActivity LeadActivity_pkey; Type: CONSTRAINT; Schema: public; Owner: gdiuser
--

ALTER TABLE ONLY public."LeadActivity"
    ADD CONSTRAINT "LeadActivity_pkey" PRIMARY KEY (id);


--
-- Name: Lead Lead_pkey; Type: CONSTRAINT; Schema: public; Owner: gdiuser
--

ALTER TABLE ONLY public."Lead"
    ADD CONSTRAINT "Lead_pkey" PRIMARY KEY (id);


--
-- Name: Lesson Lesson_pkey; Type: CONSTRAINT; Schema: public; Owner: gdiuser
--

ALTER TABLE ONLY public."Lesson"
    ADD CONSTRAINT "Lesson_pkey" PRIMARY KEY (id);


--
-- Name: Notification Notification_pkey; Type: CONSTRAINT; Schema: public; Owner: gdiuser
--

ALTER TABLE ONLY public."Notification"
    ADD CONSTRAINT "Notification_pkey" PRIMARY KEY (id);


--
-- Name: Payment Payment_pkey; Type: CONSTRAINT; Schema: public; Owner: gdiuser
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_pkey" PRIMARY KEY (id);


--
-- Name: Program Program_pkey; Type: CONSTRAINT; Schema: public; Owner: gdiuser
--

ALTER TABLE ONLY public."Program"
    ADD CONSTRAINT "Program_pkey" PRIMARY KEY (id);


--
-- Name: Review Review_pkey; Type: CONSTRAINT; Schema: public; Owner: gdiuser
--

ALTER TABLE ONLY public."Review"
    ADD CONSTRAINT "Review_pkey" PRIMARY KEY (id);


--
-- Name: Session Session_pkey; Type: CONSTRAINT; Schema: public; Owner: gdiuser
--

ALTER TABLE ONLY public."Session"
    ADD CONSTRAINT "Session_pkey" PRIMARY KEY (id);


--
-- Name: Student Student_pkey; Type: CONSTRAINT; Schema: public; Owner: gdiuser
--

ALTER TABLE ONLY public."Student"
    ADD CONSTRAINT "Student_pkey" PRIMARY KEY (id);


--
-- Name: TutorApplication TutorApplication_pkey; Type: CONSTRAINT; Schema: public; Owner: gdiuser
--

ALTER TABLE ONLY public."TutorApplication"
    ADD CONSTRAINT "TutorApplication_pkey" PRIMARY KEY (id);


--
-- Name: TutorAvailability TutorAvailability_pkey; Type: CONSTRAINT; Schema: public; Owner: gdiuser
--

ALTER TABLE ONLY public."TutorAvailability"
    ADD CONSTRAINT "TutorAvailability_pkey" PRIMARY KEY (id);


--
-- Name: TutorPayout TutorPayout_pkey; Type: CONSTRAINT; Schema: public; Owner: gdiuser
--

ALTER TABLE ONLY public."TutorPayout"
    ADD CONSTRAINT "TutorPayout_pkey" PRIMARY KEY (id);


--
-- Name: TutorProfile TutorProfile_pkey; Type: CONSTRAINT; Schema: public; Owner: gdiuser
--

ALTER TABLE ONLY public."TutorProfile"
    ADD CONSTRAINT "TutorProfile_pkey" PRIMARY KEY (id);


--
-- Name: Tutor Tutor_pkey; Type: CONSTRAINT; Schema: public; Owner: gdiuser
--

ALTER TABLE ONLY public."Tutor"
    ADD CONSTRAINT "Tutor_pkey" PRIMARY KEY (id);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: gdiuser
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: Booking_sessionId_studentId_key; Type: INDEX; Schema: public; Owner: gdiuser
--

CREATE UNIQUE INDEX "Booking_sessionId_studentId_key" ON public."Booking" USING btree ("sessionId", "studentId");


--
-- Name: Booking_studentId_status_idx; Type: INDEX; Schema: public; Owner: gdiuser
--

CREATE INDEX "Booking_studentId_status_idx" ON public."Booking" USING btree ("studentId", status);


--
-- Name: CourseModule_courseId_orderIndex_key; Type: INDEX; Schema: public; Owner: gdiuser
--

CREATE UNIQUE INDEX "CourseModule_courseId_orderIndex_key" ON public."CourseModule" USING btree ("courseId", "orderIndex");


--
-- Name: CoursePrice_courseId_currency_key; Type: INDEX; Schema: public; Owner: gdiuser
--

CREATE UNIQUE INDEX "CoursePrice_courseId_currency_key" ON public."CoursePrice" USING btree ("courseId", currency);


--
-- Name: Course_tutorId_isPublished_idx; Type: INDEX; Schema: public; Owner: gdiuser
--

CREATE INDEX "Course_tutorId_isPublished_idx" ON public."Course" USING btree ("tutorId", "isPublished");


--
-- Name: Lead_email_status_idx; Type: INDEX; Schema: public; Owner: gdiuser
--

CREATE INDEX "Lead_email_status_idx" ON public."Lead" USING btree (email, status);


--
-- Name: Lesson_moduleId_orderIndex_key; Type: INDEX; Schema: public; Owner: gdiuser
--

CREATE UNIQUE INDEX "Lesson_moduleId_orderIndex_key" ON public."Lesson" USING btree ("moduleId", "orderIndex");


--
-- Name: Notification_userId_isRead_idx; Type: INDEX; Schema: public; Owner: gdiuser
--

CREATE INDEX "Notification_userId_isRead_idx" ON public."Notification" USING btree ("userId", "isRead");


--
-- Name: Payment_bookingId_idx; Type: INDEX; Schema: public; Owner: gdiuser
--

CREATE INDEX "Payment_bookingId_idx" ON public."Payment" USING btree ("bookingId");


--
-- Name: Payment_externalId_key; Type: INDEX; Schema: public; Owner: gdiuser
--

CREATE UNIQUE INDEX "Payment_externalId_key" ON public."Payment" USING btree ("externalId");


--
-- Name: Payment_studentId_status_idx; Type: INDEX; Schema: public; Owner: gdiuser
--

CREATE INDEX "Payment_studentId_status_idx" ON public."Payment" USING btree ("studentId", status);


--
-- Name: Payment_transactionId_key; Type: INDEX; Schema: public; Owner: gdiuser
--

CREATE UNIQUE INDEX "Payment_transactionId_key" ON public."Payment" USING btree ("transactionId");


--
-- Name: Program_slug_key; Type: INDEX; Schema: public; Owner: gdiuser
--

CREATE UNIQUE INDEX "Program_slug_key" ON public."Program" USING btree (slug);


--
-- Name: Review_studentId_courseId_key; Type: INDEX; Schema: public; Owner: gdiuser
--

CREATE UNIQUE INDEX "Review_studentId_courseId_key" ON public."Review" USING btree ("studentId", "courseId");


--
-- Name: Review_tutorId_rating_idx; Type: INDEX; Schema: public; Owner: gdiuser
--

CREATE INDEX "Review_tutorId_rating_idx" ON public."Review" USING btree ("tutorId", rating);


--
-- Name: Session_courseId_startTime_idx; Type: INDEX; Schema: public; Owner: gdiuser
--

CREATE INDEX "Session_courseId_startTime_idx" ON public."Session" USING btree ("courseId", "startTime");


--
-- Name: Session_status_idx; Type: INDEX; Schema: public; Owner: gdiuser
--

CREATE INDEX "Session_status_idx" ON public."Session" USING btree (status);


--
-- Name: Student_userId_key; Type: INDEX; Schema: public; Owner: gdiuser
--

CREATE UNIQUE INDEX "Student_userId_key" ON public."Student" USING btree ("userId");


--
-- Name: TutorApplication_email_key; Type: INDEX; Schema: public; Owner: gdiuser
--

CREATE UNIQUE INDEX "TutorApplication_email_key" ON public."TutorApplication" USING btree (email);


--
-- Name: TutorAvailability_tutorId_dayOfWeek_idx; Type: INDEX; Schema: public; Owner: gdiuser
--

CREATE INDEX "TutorAvailability_tutorId_dayOfWeek_idx" ON public."TutorAvailability" USING btree ("tutorId", "dayOfWeek");


--
-- Name: TutorPayout_tutorId_status_idx; Type: INDEX; Schema: public; Owner: gdiuser
--

CREATE INDEX "TutorPayout_tutorId_status_idx" ON public."TutorPayout" USING btree ("tutorId", status);


--
-- Name: TutorProfile_tutorId_key; Type: INDEX; Schema: public; Owner: gdiuser
--

CREATE UNIQUE INDEX "TutorProfile_tutorId_key" ON public."TutorProfile" USING btree ("tutorId");


--
-- Name: Tutor_status_idx; Type: INDEX; Schema: public; Owner: gdiuser
--

CREATE INDEX "Tutor_status_idx" ON public."Tutor" USING btree (status);


--
-- Name: Tutor_userId_key; Type: INDEX; Schema: public; Owner: gdiuser
--

CREATE UNIQUE INDEX "Tutor_userId_key" ON public."Tutor" USING btree ("userId");


--
-- Name: User_email_idx; Type: INDEX; Schema: public; Owner: gdiuser
--

CREATE INDEX "User_email_idx" ON public."User" USING btree (email);


--
-- Name: User_email_key; Type: INDEX; Schema: public; Owner: gdiuser
--

CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);


--
-- Name: User_role_idx; Type: INDEX; Schema: public; Owner: gdiuser
--

CREATE INDEX "User_role_idx" ON public."User" USING btree (role);


--
-- Name: Booking Booking_sessionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: gdiuser
--

ALTER TABLE ONLY public."Booking"
    ADD CONSTRAINT "Booking_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES public."Session"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Booking Booking_studentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: gdiuser
--

ALTER TABLE ONLY public."Booking"
    ADD CONSTRAINT "Booking_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES public."Student"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: CourseModule CourseModule_courseId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: gdiuser
--

ALTER TABLE ONLY public."CourseModule"
    ADD CONSTRAINT "CourseModule_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES public."Course"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: CoursePrice CoursePrice_courseId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: gdiuser
--

ALTER TABLE ONLY public."CoursePrice"
    ADD CONSTRAINT "CoursePrice_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES public."Course"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Course Course_programId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: gdiuser
--

ALTER TABLE ONLY public."Course"
    ADD CONSTRAINT "Course_programId_fkey" FOREIGN KEY ("programId") REFERENCES public."Program"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Course Course_tutorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: gdiuser
--

ALTER TABLE ONLY public."Course"
    ADD CONSTRAINT "Course_tutorId_fkey" FOREIGN KEY ("tutorId") REFERENCES public."Tutor"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: LeadActivity LeadActivity_leadId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: gdiuser
--

ALTER TABLE ONLY public."LeadActivity"
    ADD CONSTRAINT "LeadActivity_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES public."Lead"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Lesson Lesson_moduleId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: gdiuser
--

ALTER TABLE ONLY public."Lesson"
    ADD CONSTRAINT "Lesson_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES public."CourseModule"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Notification Notification_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: gdiuser
--

ALTER TABLE ONLY public."Notification"
    ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Payment Payment_bookingId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: gdiuser
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES public."Booking"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Payment Payment_studentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: gdiuser
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES public."Student"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Review Review_courseId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: gdiuser
--

ALTER TABLE ONLY public."Review"
    ADD CONSTRAINT "Review_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES public."Course"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Review Review_studentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: gdiuser
--

ALTER TABLE ONLY public."Review"
    ADD CONSTRAINT "Review_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES public."Student"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Review Review_tutorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: gdiuser
--

ALTER TABLE ONLY public."Review"
    ADD CONSTRAINT "Review_tutorId_fkey" FOREIGN KEY ("tutorId") REFERENCES public."Tutor"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Session Session_courseId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: gdiuser
--

ALTER TABLE ONLY public."Session"
    ADD CONSTRAINT "Session_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES public."Course"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Student Student_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: gdiuser
--

ALTER TABLE ONLY public."Student"
    ADD CONSTRAINT "Student_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: TutorAvailability TutorAvailability_tutorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: gdiuser
--

ALTER TABLE ONLY public."TutorAvailability"
    ADD CONSTRAINT "TutorAvailability_tutorId_fkey" FOREIGN KEY ("tutorId") REFERENCES public."Tutor"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: TutorPayout TutorPayout_tutorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: gdiuser
--

ALTER TABLE ONLY public."TutorPayout"
    ADD CONSTRAINT "TutorPayout_tutorId_fkey" FOREIGN KEY ("tutorId") REFERENCES public."Tutor"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: TutorProfile TutorProfile_tutorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: gdiuser
--

ALTER TABLE ONLY public."TutorProfile"
    ADD CONSTRAINT "TutorProfile_tutorId_fkey" FOREIGN KEY ("tutorId") REFERENCES public."Tutor"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Tutor Tutor_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: gdiuser
--

ALTER TABLE ONLY public."Tutor"
    ADD CONSTRAINT "Tutor_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: gdiuser
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;


--
-- PostgreSQL database dump complete
--

\unrestrict mWkPahYPSApkY6LLVaezTShbjthgfBRzs8ttfiTU9tQ5gL7n4bkkwycpWDtlO4U

