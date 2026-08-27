# ARTHA CORRIDOR --- MVP TECHNICAL CHANGE SPECIFICATION

## Version 1.0 --- 18 August 2026

### Purpose

This document converts the current Artha MVP, the new competitive
strategy, the supplied research, and current external market/regulatory
evidence into a concrete product/engineering change plan.

The objective is **not** to build a larger marketplace. The objective is
to turn the current MVP into the smallest production-capable system that
can prove:

> **RFQ → qualified Indian factory shortlist → evidence → supplier
> response → sample/order → transaction outcome → repeat**

The strategic product is:

> **India manufacturing procurement infrastructure**

The immediate wedge is:

> **Find the right factory, prove the capability, and manage the
> transaction.**

------------------------------------------------------------------------

# 1. EXECUTIVE DECISION

## What must change

The current MVP is technically broad but commercially too broad.

The codebase has 27 UI pages, 47 React components, 64 API route
handlers, 32 core library modules, a deterministic + LLM matching
engine, a seven-state verification state machine, document intelligence
scaffolding, fraud scoring, transaction outcomes, Razorpay order
scaffolding, and a Supabase adapter.

However, the audit also states that there are only 10 seed supplier
profiles, zero real transactions/outcomes, and no real uploaded
documents. The current runtime can fall back to local JSON when Supabase
credentials are absent.

Therefore:

### Do NOT add another large feature set.

### Do NOT build a custom escrow system now.

### Do NOT build vector search now.

### Do NOT build ML anomaly detection now.

### Do NOT expand to many geographies now.

### Do NOT optimize the 27-page website.

Instead, convert the MVP into a **transaction-validation machine**.

------------------------------------------------------------------------

# 2. THE MVP NORTH STAR

## Primary metric

### Successful Sourcing Value (SSV)

Definition:

> Total monetary value of buyer procurement that reached a verified
> successful delivery/closure through Artha.

Secondary funnel:

1.  RFQ submitted
2.  RFQ qualified
3.  Match accepted
4.  Supplier responded
5.  Sample requested
6.  Sample accepted
7.  Order placed
8.  Order delivered
9.  Order accepted/closed
10. Repeat order

The existing outcome engine already models a similar lifecycle and
calculates Successful Sourcing Rate. Keep that architecture, but make
the transaction ledger the center of the MVP.

------------------------------------------------------------------------

# 3. PRODUCT POSITIONING CHANGE

## Current positioning

AI-powered verification and matching.

## Replace with

# Artha

## India's Manufacturing Procurement Network

### Buyer promise

> Send an RFQ. Get procurement-ready Indian factories.

### Product promise

> Find the factory. Prove the capability. Execute the transaction.

### Supplier promise

> Turn your real manufacturing capability into qualified buyer
> opportunities.

Verification is not the product.

Verification is evidence inside the product.

------------------------------------------------------------------------

# 4. WHAT TO KEEP

Keep these foundations because they directly support the new strategy:

### Keep

-   Supplier identity model
-   GSTIN validation
-   IEC/business verification
-   Supplier verification state machine
-   Physical audit model
-   Evidence model
-   Quality score
-   Freshness decay
-   RFQ model
-   Deterministic matching
-   Evidence-linked match reasons
-   Supplier response metrics
-   Quote comparison
-   Supplier dashboard
-   Buyer dashboard
-   Order lifecycle
-   Dispute model
-   Outcome tracking
-   Audit log
-   Admin review
-   Agent API foundation
-   Razorpay integration as payment infrastructure
-   Supabase/PostgreSQL adapter
-   CSRF/rate limiting/input validation
-   multilingual foundation

The current audit confirms these foundations exist.

------------------------------------------------------------------------

# 5. WHAT TO REMOVE FROM THE MVP SURFACE

These should not be deleted from the repository immediately. They should
be hidden, deprioritized, or marked experimental.

## Hide/deprioritize

### /about

Keep as a basic company page, but it is not a growth priority.

### /blog

Do not build a content empire before proving transactions.

### /document-intelligence

Keep the underlying engine, but remove the impression that Artha has
production-grade automated document AI when the current implementation
uses mock dossiers.

### /feedback

Useful internally, but not a primary navigation item.

### /market/pricing

Do not expose "market intelligence" unless the data source and freshness
are real.

### /ai-assistant

Do not make this a headline feature yet.

The assistant should be a thin interface over real supplier/RFQ data,
not a generic chatbot.

### /categories

Keep, but make category pages transaction-oriented.

### /pricing

Change from verification-first pricing to buyer/supplier service pricing
after real willingness-to-pay tests.

### /verified

Keep, but turn it into an evidence methodology page rather than a badge
marketing page.

------------------------------------------------------------------------

# 6. THE NEW MVP INFORMATION ARCHITECTURE

The buyer should see only five primary actions:

1.  **Source**
2.  **Suppliers**
3.  **RFQs**
4.  **Deal Rooms**
5.  **Orders**

Supplier:

1.  **Profile**
2.  **RFQs**
3.  **Quotes**
4.  **Verification**
5.  **Orders**

Admin:

1.  **RFQs**
2.  **Supplier Queue**
3.  **Verification**
4.  **Deal Rooms**
5.  **Orders**
6.  **Disputes**
7.  **Evidence**
8.  **Metrics**

------------------------------------------------------------------------

# 7. THE NEW CORE FLOW

## Buyer

Landing page

↓

"Tell us what you need"

↓

RFQ

↓

Artha qualification

↓

Top 3--5 suppliers

↓

Evidence comparison

↓

Buyer shortlist

↓

Supplier quote

↓

Sample

↓

Deal Room

↓

Order

↓

Production

↓

Inspection

↓

Shipment

↓

Delivery

↓

Outcome

↓

Repeat

------------------------------------------------------------------------

# 8. BUILD THE ARTHA DEAL ROOM NOW

This is the highest-priority product addition.

## Route

`/deals/[dealId]`

## Data

### Buyer requirement

-   product
-   specification
-   drawing
-   quantity
-   target date
-   destination
-   Incoterm
-   required certifications
-   quality requirements

### Supplier

-   supplier ID
-   verified identity
-   capability evidence
-   capacity evidence
-   quote
-   lead time
-   payment terms

### Transaction

-   RFQ
-   quote
-   purchase order
-   contract/reference document
-   milestones
-   payment status
-   inspection
-   shipment
-   delivery
-   dispute
-   final outcome

### Evidence

Every important claim must have:

-   claim
-   evidence type
-   evidence ID
-   source
-   captured date
-   expiry date
-   verification status
-   reviewer
-   confidence
-   notes

### AI

-   recommended supplier
-   score
-   reasons
-   missing evidence
-   risks
-   rejected alternatives
-   confidence

------------------------------------------------------------------------

# 9. FACTORY INTELLIGENCE DATA MODEL

Do not keep putting everything into one large Supplier object.

Split the domain.

## Supplier

Identity and commercial relationship.

## LegalEntity

-   GSTIN
-   legal name
-   trade name
-   CIN
-   IEC
-   Udyam
-   registered address
-   status
-   source
-   checkedAt

## FactorySite

-   address
-   GPS
-   GIDC zone
-   site type
-   floor area
-   employees
-   operating status
-   evidence

## Capability

-   process
-   material
-   product family
-   tolerance
-   dimensions
-   machinery
-   capacity
-   MOQ
-   lead time
-   evidence

## Certification

-   type
-   issuer
-   number
-   issue date
-   expiry
-   scope
-   document
-   verification status

## Evidence

-   type
-   claim
-   source
-   capturedAt
-   expiresAt
-   verifiedBy
-   status
-   confidence

## SupplierPerformance

-   RFQs received
-   response time
-   quote acceptance
-   sample pass rate
-   order count
-   on-time delivery
-   defect rate
-   dispute rate
-   cancellation rate
-   repeat order rate

## TransactionOutcome

-   RFQ
-   supplier
-   buyer
-   stage
-   monetary value
-   timestamps
-   delivery result
-   quality result
-   buyer rating
-   dispute result

This becomes the actual Artha data moat.

------------------------------------------------------------------------

# 10. EVIDENCE-FIRST ARCHITECTURE

A score without evidence is dangerous.

Every score component should point to evidence.

Bad:

> Supplier score = 92

Good:

> Supplier score = 92

With:

-   GST verified: 2026-08-15
-   IEC verified: 2026-08-15
-   factory visit: 2026-08-16
-   CNC capability evidence: 2026-08-16
-   ISO 9001 verified: 2026-08-16
-   7 completed orders
-   95.8% on-time delivery
-   1 unresolved dispute

The buyer must be able to inspect why the score exists.

------------------------------------------------------------------------

# 11. CHANGE THE MATCHING ENGINE

The current deterministic engine has useful hard constraints and
evidence-linked reasons.

Keep that.

But change the score architecture.

## Current weakness

Geography has a large role in the generic score.

That is appropriate for a Gujarat beachhead but dangerous as the
platform expands.

## New score

### Hard constraints

A supplier cannot qualify if:

-   wrong manufacturing process
-   incompatible material
-   mandatory certification missing
-   impossible quantity/capacity
-   prohibited geography
-   supplier suspended
-   evidence too stale for a critical claim

### Soft ranking

Rank using:

1.  capability fit
2.  specification/tolerance fit
3.  capacity fit
4.  certification fit
5.  historical transaction performance
6.  delivery performance
7.  sample performance
8.  price competitiveness
9.  response speed
10. evidence freshness
11. buyer/supplier corridor fit

Geography should be a contextual factor, not a permanent moat.

------------------------------------------------------------------------

# 12. DO NOT LET AI INVENT PROCUREMENT FACTS

The LLM must never be the source of truth.

Architecture:

``` text
DATABASE
   ↓
DETERMINISTIC FILTER
   ↓
EVIDENCE RETRIEVAL
   ↓
DETERMINISTIC SCORE
   ↓
OPTIONAL LLM EXPLANATION
```

The LLM may:

-   interpret buyer language
-   normalize specifications
-   extract requirements
-   summarize evidence
-   explain rankings

The LLM must not:

-   invent machines
-   invent capacity
-   invent certifications
-   invent customers
-   invent transaction history
-   infer that a supplier can manufacture something without evidence

------------------------------------------------------------------------

# 13. RFQ SHOULD BECOME THE PRIMARY INPUT

Current RFQ fields are too simple for high-value manufacturing
procurement.

Add:

## Requirement object

-   product name
-   product category
-   free-text requirement
-   material
-   dimensions
-   tolerance
-   quantity
-   annual volume
-   MOQ
-   sample quantity
-   required certification
-   required process
-   quality standard
-   packaging
-   destination
-   Incoterm
-   target delivery
-   target price
-   currency
-   drawing/file attachments

The user should be able to upload a drawing/specification.

The system extracts structured requirements but marks every extracted
value as:

-   user-provided
-   extracted
-   confirmed
-   uncertain

------------------------------------------------------------------------

# 14. RFQ QUALIFICATION LAYER

Do not immediately run matching.

Add:

`draft → submitted → needs_clarification → qualified → matching → matched`

The qualification agent asks only the missing questions necessary to
produce a useful shortlist.

Example:

> "What material grade?"

> "Is ±0.02mm required for all dimensions or only critical dimensions?"

> "Is ISO 9001 mandatory?"

This dramatically improves matching quality.

------------------------------------------------------------------------

# 15. MATCH RESULT UX

Do not show:

> Supplier #1: 94

Show:

# Best fit

### Supplier A

**Fit: 94/100**

Why:

-   Exact process match
-   Required material confirmed
-   Tolerance capability evidenced
-   Required certification verified
-   Capacity appears sufficient
-   Strong delivery history

### Evidence freshness

**18 days**

### Missing evidence

**Current available capacity confirmation**

### Risk

**Low**

### Next action

**Request quote**

------------------------------------------------------------------------

# 16. ADD "WHY NOT" TO MATCHING

This is strategically important.

For every RFQ:

> We considered 37 suppliers.

> 8 failed hard requirements.

> 11 lacked evidence.

> 5 had insufficient capacity.

> 4 had weak delivery history.

> 9 were lower-fit alternatives.

This turns Artha from a search engine into a procurement decision
system.

------------------------------------------------------------------------

# 17. SUPPLIER PROFILE REDESIGN

The current supplier profile is too directory-like.

Replace the top of the page with:

# Can this factory make your product?

Then:

### Capability

What they make.

### Evidence

Why Artha believes it.

### Factory

Where and how it is made.

### Performance

What happened on real Artha transactions.

### Commercial

MOQ, lead time, pricing range.

### Risk

Missing/expired evidence.

### Request quote

Primary CTA.

------------------------------------------------------------------------

# 18. VERIFICATION BADGES

Keep verification tiers, but change their semantics.

## Listed

Basic identity/contact information.

## Business Verified

Legal/business checks passed.

## Factory Verified

Physical factory evidence confirmed.

## Transaction Proven

Supplier has completed qualifying Artha transactions.

## Performance Proven

Enough transaction history exists for meaningful delivery/quality
metrics.

The most valuable badge should eventually be:

# Transaction Proven

Not:

# Paid Premium.

------------------------------------------------------------------------

# 19. DO NOT LET PAYMENT CREATE A HIGHER TRUST SCORE

A supplier must never be able to buy ranking.

Pricing can buy:

-   profile tools
-   analytics
-   lead management
-   extra evidence processing
-   faster verification scheduling where operationally justified

Pricing must not buy:

-   trust score
-   transaction performance
-   ranking position
-   "verified" status
-   buyer reviews.

------------------------------------------------------------------------

# 20. SUPPLIER ACQUISITION UX

The current `/get-listed` flow is good infrastructure.

Add:

### "Build my factory profile"

The supplier submits:

-   GSTIN
-   IEC
-   products
-   processes
-   machinery
-   certifications
-   factory photos
-   video
-   capacity
-   export markets
-   contact

Then Artha generates:

# Procurement-ready factory profile

This is the seller acquisition product.

The supplier gets tangible value before paying.

------------------------------------------------------------------------

# 21. ADMIN VERIFICATION CONSOLE

The admin panel must become the operational heart of the MVP.

For each supplier:

### Identity

Green/red evidence.

### Factory

Map + photos + GPS.

### Documents

Document list + expiry.

### Capability

Claim/evidence matrix.

### Risk

Fraud flags.

### Performance

Real transaction metrics.

### Decision

Approve / request evidence / reject / suspend.

### Audit trail

Who changed what and when.

------------------------------------------------------------------------

# 22. CRITICAL SECURITY CHANGE

The technical audit calls the architecture production-grade, but I would
**not** call the current deployment production-grade yet.

Why?

The audit itself shows that:

-   local JSON is the active fallback
-   only 10 seed suppliers exist
-   real transactions are zero
-   real documents are zero
-   credentials are not configured
-   payment is scaffolded
-   the database has a configured adapter but is not necessarily the
    active production path.

Therefore:

# Production gate = Supabase/PostgreSQL only.

If production environment variables are missing:

### fail closed.

Do not silently switch to local JSON.

Local JSON should be:

`NODE_ENV=development` only.

------------------------------------------------------------------------

# 23. AUTHORIZATION MUST BE OBJECT-LEVEL

Authentication is not authorization.

Every route involving:

-   RFQ
-   quote
-   shortlist
-   order
-   dispute
-   document
-   deal
-   supplier data

must enforce:

``` text
request.user
    ↓
role
    ↓
resource ownership
    ↓
allowed action
```

Example:

A buyer may read only:

-   their RFQs
-   their quotes
-   their deals
-   their orders

A supplier may read only:

-   their supplier profile
-   their assigned RFQs
-   their own quotes
-   their orders

An admin may access all.

Agent API users must have explicit scopes.

------------------------------------------------------------------------

# 24. PAYMENT ARCHITECTURE

Do not call the current Razorpay flow "escrow" unless the actual
regulated arrangement supports that terminology.

Current MVP:

``` text
Artha
  ↓
Razorpay
  ↓
payment
```

Correct MVP architecture:

``` text
Artha Deal
    ↓
Payment Provider
    ↓
regulated funds flow
    ↓
Artha transaction state
```

Artha owns the transaction state machine.

The regulated payment provider owns the regulated funds movement.

RBI directly regulates entities facilitating cross-border import/export
payment aggregation, and payment aggregation involves regulated
escrow/account arrangements.

Therefore:

### MVP

Use a regulated payment partner.

### Later

Consider a regulated PA/PA-CB structure or acquisition only after
meaningful transaction scale and legal/regulatory planning.

------------------------------------------------------------------------

# 25. PAYMENT STATE MACHINE

Implement an immutable transaction ledger.

Do not rely only on a mutable `escrowStatus`.

Use events:

``` text
ORDER_CREATED
PAYMENT_INITIATED
PAYMENT_AUTHORIZED
PAYMENT_CAPTURED
PAYMENT_FAILED
SUPPLIER_ACCEPTED
PRODUCTION_STARTED
MILESTONE_SUBMITTED
INSPECTION_REQUESTED
INSPECTION_PASSED
SHIPMENT_CREATED
DELIVERY_CONFIRMED
INSPECTION_WINDOW_OPENED
DISPUTE_OPENED
DISPUTE_RESOLVED
REFUND_REQUESTED
REFUND_COMPLETED
ORDER_CLOSED
```

Every event:

-   id
-   orderId
-   actor
-   timestamp
-   provider event ID
-   previous state
-   new state
-   metadata
-   idempotency key

This makes payment/order reconciliation auditable.

------------------------------------------------------------------------

# 26. PAYMENT WEBHOOK REQUIREMENTS

Every payment webhook must be:

-   signature verified
-   idempotent
-   persisted
-   replay-safe
-   mapped to an internal order
-   logged
-   reconciled

Never allow:

``` text
webhook → blindly update status
```

Use:

``` text
provider event
    ↓
verify signature
    ↓
check event ID
    ↓
persist event
    ↓
transactionally update order
    ↓
emit internal event
```

------------------------------------------------------------------------

# 27. DOCUMENT STORAGE

Do not store production documents directly in the application
filesystem.

Use object storage.

Recommended logical structure:

``` text
/suppliers/{supplierId}/documents/{documentId}
/suppliers/{supplierId}/audits/{auditId}
/rfqs/{rfqId}/attachments/{attachmentId}
/deals/{dealId}/contracts/{documentId}
/orders/{orderId}/inspection/{documentId}
```

Store only metadata in PostgreSQL.

Use signed URLs.

Every document needs:

-   owner
-   classification
-   checksum
-   MIME type
-   size
-   createdAt
-   expiry
-   verification status
-   uploader
-   access log

------------------------------------------------------------------------

# 28. REAL DOCUMENT INTELLIGENCE

Do not prioritize sophisticated OCR yet.

First build:

``` text
upload
→ store
→ classify
→ extract
→ validate
→ human review
→ evidence record
```

For the first 50 factories, human verification is acceptable.

The product advantage comes from creating correct evidence, not from
pretending OCR is autonomous.

------------------------------------------------------------------------

# 29. DATA FRESHNESS

Keep freshness decay, but improve it.

Different evidence needs different expiry.

Example:

### GST/business status

Short refresh interval.

### Bank verification

Refresh on relevant transaction/onboarding events.

### Physical factory audit

Periodic.

### Certification

Use actual certificate expiry.

### Machinery/capacity

Much shorter validity than legal identity.

### Transaction performance

Continuously updated.

Therefore:

# Evidence freshness must be field-specific.

Not one universal multiplier.

------------------------------------------------------------------------

# 30. TRUST SCORE REDESIGN

Do not make a single 100-point score the primary truth.

Show:

### Identity confidence

### Factory confidence

### Capability confidence

### Compliance confidence

### Performance confidence

### Transaction confidence

Then an overall:

# Procurement Confidence

The overall score should be a summary, not the underlying data model.

------------------------------------------------------------------------

# 31. FRAUD ENGINE REDESIGN

The current four-signal fraud model is useful as a prototype but too
simplistic for production.

Do not heavily penalize domains such as `.cn`, `.ru`, etc. merely
because of geography.

That can create false positives and unfair treatment.

Instead use behavior and consistency signals:

-   identity mismatch
-   GST/entity mismatch
-   bank-account mismatch
-   document inconsistency
-   repeated account/device patterns
-   suspicious RFQ velocity
-   abnormal quote behavior
-   supplier/buyer collusion indicators
-   unusual payment patterns
-   address reuse
-   phone/email reuse
-   sudden profile changes
-   dispute anomalies.

Use:

``` text
risk score → review queue
```

rather than:

``` text
risk score → automatic accusation
```

except for clearly defined security controls.

------------------------------------------------------------------------

# 32. BUYER VERIFICATION

You need buyer-side trust too.

Add:

### Buyer verification

-   company domain
-   business identity
-   role
-   purchasing authority band
-   country
-   sanctions screening where legally/operationally appropriate
-   transaction behavior
-   payment history

This matters because Alibaba's protection system and modern
trade-verification competitors are increasingly bilateral.

Artha cannot build supplier trust while allowing anonymous buyer risk.

------------------------------------------------------------------------

# 33. SUPPLIER PERFORMANCE GRAPH

Create a dedicated performance service.

Metrics:

``` text
response_rate
median_response_time
quote_acceptance_rate
sample_pass_rate
order_completion_rate
on_time_rate
defect_rate
dispute_rate
cancellation_rate
repeat_order_rate
```

Every metric needs:

-   numerator
-   denominator
-   observation window
-   sample size
-   confidence
-   lastUpdated

Never show:

> 96% on-time

if only one order exists.

Instead:

> 1/1 orders on time --- insufficient history.

This is crucial.

------------------------------------------------------------------------

# 34. MATCH CONFIDENCE

Do the same thing with matching.

Do not show:

> 94% match

unless there is enough evidence.

Use:

### High confidence

Strong evidence for critical requirements.

### Medium confidence

Good match but missing important evidence.

### Low confidence

Possible match requiring verification.

The score and confidence are different concepts.

------------------------------------------------------------------------

# 35. BUILD A HUMAN-IN-THE-LOOP PROCUREMENT SYSTEM

For the first transactions:

``` text
AI
 ↓
suggest suppliers
 ↓
Artha procurement operator reviews
 ↓
buyer receives shortlist
```

This is not a failure.

This is how you collect ground truth.

Every operator correction becomes:

-   matching feedback
-   evidence feedback
-   supplier capability correction
-   buyer preference data.

------------------------------------------------------------------------

# 36. DO NOT BUILD PGVECTOR YET

The audit says vector search is planned.

Do not prioritize it.

For 50--500 suppliers:

PostgreSQL + structured filters + deterministic ranking + LLM extraction
is enough.

Introduce embeddings when:

-   RFQs are sufficiently numerous
-   product descriptions become highly variable
-   structured taxonomy stops capturing buyer intent
-   search quality becomes measurable.

The order should be:

``` text
rules
→ structured taxonomy
→ hybrid lexical/vector
→ learning-to-rank
```

Not:

``` text
LLM/vector search first
```

------------------------------------------------------------------------

# 37. DO NOT BUILD ML ANOMALY DETECTION YET

You have no real transaction dataset.

First collect:

-   normal transactions
-   failed transactions
-   delayed transactions
-   disputed transactions
-   fraud cases.

Then train.

Until then:

### rules + review queue.

------------------------------------------------------------------------

# 38. AGENT API

Keep the agent API foundation, but make it read-only initially.

Public:

``` text
GET /v1/suppliers/search
GET /v1/suppliers/{id}
GET /v1/suppliers/{id}/capabilities
GET /v1/suppliers/{id}/evidence
POST /v1/rfqs
GET /v1/rfqs/{id}/matches
```

Do not initially expose sensitive:

-   bank information
-   private buyer data
-   private supplier documents
-   transaction financial details.

Use API keys with scopes.

------------------------------------------------------------------------

# 39. API VERSIONING

Move to:

``` text
/api/v1/...
```

and:

``` text
/api/agent/v1/...
```

Define:

-   request schema
-   response schema
-   error schema
-   rate limit
-   authentication
-   idempotency
-   pagination.

------------------------------------------------------------------------

# 40. DATABASE MIGRATION

Production:

### PostgreSQL / Supabase

Required.

Core tables:

``` text
users
organizations
organization_members
suppliers
factory_sites
supplier_capabilities
supplier_products
certifications
evidence
audits
buyers
rfqs
rfq_requirements
rfq_matches
quotes
shortlists
deals
deal_events
purchase_orders
order_items
payment_events
shipments
inspections
disputes
outcomes
reviews
fraud_cases
audit_logs
api_keys
notifications
documents
```

Avoid putting the entire business into giant JSON columns.

Use relational tables for important entities and JSON only for flexible
metadata.

------------------------------------------------------------------------

# 41. ORGANIZATION MODEL

Do not model users as the only ownership boundary.

Use:

``` text
Organization
  ├── users
  ├── suppliers
  ├── buyers
  ├── RFQs
  ├── deals
  └── orders
```

This supports:

-   procurement teams
-   supplier teams
-   multiple employees
-   agents
-   future enterprise customers.

------------------------------------------------------------------------

# 42. EVENT MODEL

Add an internal event system even if initially implemented
synchronously.

Events:

``` text
supplier.verified
supplier.evidence.expiring
rfq.created
rfq.qualified
rfq.matched
quote.submitted
sample.accepted
deal.created
order.created
payment.captured
shipment.created
delivery.confirmed
inspection.opened
dispute.opened
order.closed
supplier.performance.updated
```

This lets notifications, analytics, scoring and integrations evolve
independently.

------------------------------------------------------------------------

# 43. OBSERVABILITY

Before production transactions, add:

### Structured logs

Every request gets:

-   requestId
-   userId
-   organizationId
-   route
-   duration
-   status

### Error monitoring

Track exceptions.

### Business events

Track every important lifecycle transition.

### Metrics

At minimum:

-   RFQs/day
-   matches/RFQ
-   supplier response time
-   order conversion
-   successful sourcing rate
-   payment failure
-   dispute rate
-   API latency
-   error rate

------------------------------------------------------------------------

# 44. TESTING

You currently have zero TypeScript errors, which is good, but type
correctness is not transaction correctness.

Add:

### Unit tests

-   scoring
-   freshness
-   GST validation
-   state transitions
-   fraud rules

### Integration tests

-   auth
-   RFQ
-   matching
-   supplier quote
-   order
-   payment webhook
-   dispute

### End-to-end tests

One complete flow:

``` text
buyer signup
→ RFQ
→ match
→ supplier quote
→ shortlist
→ order
→ payment test
→ supplier acceptance
→ shipment
→ delivery
→ inspection
→ closure
```

### Security tests

-   unauthorized resource access
-   cross-organization access
-   replayed webhook
-   forged webhook
-   expired session
-   CSRF
-   rate limits
-   malicious uploads
-   oversized files
-   invalid MIME types.

------------------------------------------------------------------------

# 45. MVP FEATURE PRIORITY

## P0 --- must ship

1.  Production PostgreSQL
2.  Organization/role authorization
3.  Evidence model
4.  Factory capability model
5.  RFQ qualification
6.  Match explanation
7.  Deal Room
8.  transaction event ledger
9.  payment webhook idempotency
10. document object storage
11. admin operations console
12. outcome metrics
13. real supplier onboarding
14. real buyer onboarding
15. observability
16. E2E transaction test

## P1 --- ship after first transactions

1.  inspection workflow
2.  production milestones
3.  buyer verification
4.  supplier performance dashboard
5.  evidence expiry alerts
6.  supplier monitoring
7.  better RFQ extraction
8.  agent API hardening

## P2 --- later

1.  vector search
2.  ML anomaly detection
3.  financing
4.  logistics optimization
5.  advanced API
6.  automated document authenticity
7.  cross-border financial entity
8.  acquisition strategy

------------------------------------------------------------------------

# 46. FEATURES TO FREEZE

Freeze:

-   generic chatbot expansion
-   broad blog
-   dozens of new categories
-   advanced AI agents
-   custom escrow
-   lending
-   proprietary payment processor
-   ML fraud
-   global expansion
-   elaborate supplier gamification
-   marketplace advertising system
-   complex pricing plans.

Until real transactions exist.

------------------------------------------------------------------------

# 47. THE FIRST TECHNICAL MILESTONE

## Milestone A --- "Production-safe MVP"

Acceptance criteria:

### Database

-   PostgreSQL active
-   local JSON impossible in production
-   migrations versioned
-   backups enabled
-   restore tested

### Auth

-   organization-level authorization
-   role permissions
-   resource ownership checks

### Evidence

-   every verification claim has evidence
-   evidence has timestamps
-   expiry supported
-   access logged

### RFQ

-   structured requirement model
-   attachments
-   qualification state
-   match state

### Matching

-   deterministic hard constraints
-   evidence-linked score
-   confidence
-   missing evidence
-   why-not explanation

### Deal

-   Deal Room
-   event timeline
-   quote
-   sample
-   order
-   shipment
-   delivery
-   outcome

### Payments

-   regulated provider integration
-   signature verification
-   idempotent webhook
-   reconciliation
-   no fake escrow claims

### Admin

-   verification queue
-   evidence review
-   RFQ queue
-   transaction queue
-   dispute queue

------------------------------------------------------------------------

# 48. FIRST REAL DATA MILESTONE

Do not target 500 factories first.

Target:

## 25 real factories

with:

-   real GST/business data
-   real factory location
-   real photos
-   real machinery
-   real capability
-   real certificates
-   real capacity claims
-   real human verification.

Then:

## 10 qualified buyer conversations

Then:

## 5 real RFQs

Then:

## 3 RFQ → supplier response cycles

Then:

## 1 paid transaction

This is more valuable than another 10,000 lines of code.

------------------------------------------------------------------------

# 49. 60-DAY EXECUTION

## Days 1--10

### Engineering

-   production PostgreSQL
-   authorization
-   evidence schema
-   object storage
-   webhook hardening
-   event ledger
-   admin verification console

### Operations

-   visit/contact 25 factories
-   capture real evidence
-   create real profiles

------------------------------------------------------------------------

## Days 10--30

### Engineering

-   RFQ qualification
-   Deal Room
-   evidence-linked matching
-   supplier performance
-   buyer verification

### Sales

15 buyer conversations/week.

Target:

-   10 serious buyers
-   5 RFQs
-   25--40 verified factories

------------------------------------------------------------------------

## Days 30--60

### Engineering

-   transaction workflow
-   sample/order lifecycle
-   inspection
-   dispute
-   outcome analytics
-   production monitoring

### Business

Complete at least:

-   3 RFQ → match → response cycles
-   1 paid transaction if possible

Record every failure.

------------------------------------------------------------------------

# 50. THE MOST IMPORTANT PRODUCT LOOP

The MVP should optimize:

``` text
RFQ
 ↓
QUALIFY
 ↓
MATCH
 ↓
BUYER ACCEPTS MATCH
 ↓
SUPPLIER RESPONDS
 ↓
SAMPLE
 ↓
ORDER
 ↓
DELIVERY
 ↓
OUTCOME
 ↓
RANKING IMPROVES
```

Do not optimize:

``` text
homepage traffic
```

Do not optimize:

``` text
number of badges
```

Do not optimize:

``` text
number of registered suppliers
```

Do not optimize:

``` text
AI demo quality
```

------------------------------------------------------------------------

# 51. COMPETITIVE RESPONSE

Current competitors mean verification alone is no longer enough.

IndiaMART already combines AI-led recommendations, verified
suppliers/TrustSEAL and Buyer Payment Protection.

Alibaba Trade Assurance already combines online order terms, payment
protection, dispute assistance and transaction protection.

Vetrade already offers rapid GST/IEC/MCA-style supplier verification.

Zetwerk operates much deeper into manufacturing execution, with a large
supplier/facility network and a manufacturing operating system.

Therefore Artha's MVP differentiation must be:

# Evidence + Capability + Procurement Workflow

not:

# Badge + Directory + AI chatbot

------------------------------------------------------------------------

# 52. THE STRATEGIC DIFFERENTIATOR

Artha should eventually answer:

> "Can this exact factory make this exact requirement successfully?"

That requires three datasets:

### Capability

Can they make it?

### Evidence

Why do we believe that?

### Outcome

Did they actually deliver?

That triangle is the core product.

------------------------------------------------------------------------

# 53. THE PROCUREMENT CONFIDENCE OBJECT

Define a machine-readable object:

``` typescript
type ProcurementConfidence = {
  overall: number
  identity: number
  factory: number
  capability: number
  compliance: number
  performance: number
  transaction: number
  confidenceLevel: "high" | "medium" | "low"
  missingEvidence: string[]
  staleEvidence: string[]
  risks: string[]
  generatedAt: string
}
```

Every supplier/RFQ match should produce one.

------------------------------------------------------------------------

# 54. THE ARTHA RECOMMENDATION OBJECT

``` typescript
type SupplierRecommendation = {
  supplierId: string
  fitScore: number
  confidence: "high" | "medium" | "low"
  hardConstraintsPassed: boolean
  strengths: string[]
  evidence: EvidenceReference[]
  missingEvidence: EvidenceRequirement[]
  risks: Risk[]
  whyRecommended: string[]
  whyNotOthers: string[]
  nextAction:
    | "request_quote"
    | "request_capacity"
    | "request_sample"
    | "request_audit"
}
```

This should become the core API response.

------------------------------------------------------------------------

# 55. THE ARTHA DEAL OBJECT

``` typescript
type Deal = {
  id: string
  buyerOrgId: string
  supplierId: string
  rfqId: string
  quoteId?: string
  orderId?: string

  status:
    | "qualification"
    | "matching"
    | "supplier_contacted"
    | "sample"
    | "negotiation"
    | "ordered"
    | "production"
    | "inspection"
    | "shipping"
    | "delivered"
    | "disputed"
    | "closed"
    | "lost"

  requirements: RequirementSnapshot
  evidenceSnapshot: EvidenceSnapshot
  commercialSnapshot: CommercialSnapshot

  createdAt: string
  updatedAt: string
}
```

The snapshot is important.

A supplier's score can change later, but the deal must preserve what
evidence existed when the buyer made the decision.

------------------------------------------------------------------------

# 56. DO NOT MUTATE HISTORICAL EVIDENCE

This is critical.

If:

``` text
Supplier score = 91
```

on August 20 and becomes:

``` text
Supplier score = 76
```

in October,

the August deal must still retain the August evidence snapshot.

This matters for:

-   disputes
-   auditability
-   buyer trust
-   financing
-   future legal/regulatory requirements.

------------------------------------------------------------------------

# 57. BUSINESS MODEL FOR MVP

Do not overcomplicate pricing.

Test three monetization points:

### Buyer

Free initial sourcing.

Charge for:

-   managed sourcing
-   inspection
-   transaction protection/service
-   enterprise workflow.

### Supplier

Free basic profile.

Charge for:

-   verification
-   advanced profile tools
-   analytics
-   lead management.

### Transaction

Take a transparent service/transaction fee where legally and
contractually appropriate.

Do not depend on supplier subscription revenue as the primary moat.

------------------------------------------------------------------------

# 58. DISTRIBUTION MUST BE BUILT INTO THE PRODUCT

Every RFQ should generate:

-   buyer CRM record
-   supplier outreach list
-   match history
-   buyer feedback
-   rejection reasons
-   supplier response metrics.

Every supplier visit should generate:

-   supplier profile
-   capability records
-   evidence
-   follow-up task
-   buyer-match eligibility.

The CRM and marketplace cannot be separate.

They are one operating system.

------------------------------------------------------------------------

# 59. THE FIRST INTERNAL TOOLS TO BUILD

Not more customer-facing pages.

Build:

## Supplier Acquisition Console

-   target factory list
-   contact attempts
-   visit status
-   verification status
-   evidence missing
-   next action

## Buyer Pipeline

-   company
-   contact
-   category
-   RFQ
-   stage
-   next action
-   expected value

## RFQ Command Center

-   new RFQs
-   qualification
-   matches
-   suppliers contacted
-   responses
-   samples
-   orders

## Transaction Command Center

-   active deals
-   production
-   inspections
-   shipments
-   disputes
-   money status

These will produce more value than another public-facing feature.

------------------------------------------------------------------------

# 60. FINAL MVP DEFINITION

The Artha MVP is successful when this can happen for a real buyer:

> A buyer submits a real industrial RFQ.

Artha:

1.  understands the requirement
2.  identifies qualified factories
3.  shows evidence
4.  explains why the factories fit
5.  identifies missing evidence
6.  contacts suppliers
7.  collects quotes
8.  helps the buyer select one
9.  creates a Deal Room
10. manages sample/order workflow
11. uses regulated payment infrastructure where applicable
12. tracks production/shipment/delivery
13. records the outcome
14. updates supplier performance
15. makes the next RFQ better.

That is the MVP.

Everything else is secondary.

------------------------------------------------------------------------

# 61. FINAL BUILD ORDER

## P0

**PostgreSQL + authorization + evidence + Deal Room + event ledger +
real factory data**

↓

## P0

**RFQ qualification + deterministic matching + evidence explanations**

↓

## P0

**Supplier response + quote + sample + order**

↓

## P0

**Payment provider + webhook reconciliation**

↓

## P0

**Delivery + inspection + dispute + outcome**

↓

## P0

**Analytics: Successful Sourcing Value + funnel**

↓

## P1

**Inspection network + production milestones**

↓

## P1

**Supplier performance graph**

↓

## P1

**Agent API**

↓

## P2

**Vector search**

↓

## P2

**ML fraud/anomaly detection**

↓

## P2

**Trade finance partnerships**

↓

## P3

**Regulated financial entity/acquisition**

------------------------------------------------------------------------

# 62. THE ONE ENGINEERING RULE

> **Do not build a feature unless it improves RFQ → successful sourcing,
> supplier evidence quality, transaction safety, or repeat
> procurement.**

If it does not improve one of those:

# freeze it.

------------------------------------------------------------------------

# 63. THE ONE BUSINESS RULE

> **Every week must produce new real factories, new real buyer
> conversations, new RFQs, or new transaction evidence.**

Otherwise the company is accumulating code instead of accumulating its
moat.

------------------------------------------------------------------------

# 64. FINAL VERDICT

The existing MVP should **not be thrown away**.

It should be **compressed and redirected**.

The current codebase is a strong technical skeleton, but the technical
audit's description of it as already "production-grade" is too generous.
It is closer to:

> **production-oriented architecture with substantial prototype/demo
> implementation and missing real-world operational validation.**

The largest gap is not another AI model.

It is:

# **real factory evidence + real buyer demand + real transactions.**

The winning architecture is therefore:

``` text
                 ARTHA
                   │
             PROCUREMENT
                   │
          ┌────────┴────────┐
          │                 │
       BUYER             FACTORY
          │                 │
         RFQ          CAPABILITY GRAPH
          │                 │
          └───────┬─────────┘
                  │
              MATCHING
                  │
              EVIDENCE
                  │
              DEAL ROOM
                  │
              TRANSACTION
                  │
        ┌─────────┼─────────┐
        │         │         │
     PAYMENT   INSPECTION  LOGISTICS
        │         │         │
        └─────────┼─────────┘
                  │
               OUTCOME
                  │
          PERFORMANCE DATA
                  │
          BETTER MATCHING
                  │
          REPEAT PROCUREMENT
```

That is the MVP to build now.

Not a larger IndiaMART.

Not a smaller Alibaba.

Not a badge marketplace.

A **transaction-producing manufacturing procurement machine**.
