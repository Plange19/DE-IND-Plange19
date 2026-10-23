# IA02 - Client Interview Evidence and Requirement Transformation Memo
Student:RICHARD RHULE 
Project: FlowVantage - Delivery Flow Management
Team Repo: https://github.com/Plange19/FlowVantage
Personal Repo: https://github.com/Plange19/DE-IND-Plange19
Date: 23 Oct 2026
AI Disclosure: Meta AI used for structure, interview notes verified by me.


**Workflow (3):**
1. Walk me through how you currently track a new business lead from first contact to project completion?
2. How do you currently manage appointments with clients - what tool do you use?
3. What steps do you take when you get a new project - how do you link contacts to projects?

**Pain Points (2):**
4. What is the biggest problem you face tracking contacts across phone, WhatsApp and notebook?
5. Have you ever missed an appointment or lost a contact because it was not in one place?

**Data (2):**
6. What information do you need to store for each contact (name, phone, business type, notes)?
7. What details do you track for each project (status, deadline, client, cost)?

**Success Criteria (2):**
8. How would you know this app is successful - what would it save you per week?
9. If contacts, projects and appointments were in one place, what would be the most valuable feature?

**Security/Privacy (1):**
10. Who should see your business contacts - should it be private only to you or shared? Any privacy concern importing phone contacts?

**Failures/Exceptions (2):**
11. What should happen if you import 500 contacts and some have duplicate names or invalid numbers?
12. What if you book two appointments at same time or client cancels appointment last minute?

## 2. Authentic Interview Evidence

**Date:** 20 Oct 2026
Time: 18:00 GMT
Medium:GOOGLE MMET 
Evidence Type: Real notes from conversation and picture taken on google meet cal.

Summary:
Client currently uses phone contacts + notebook for projects + phone calendar for appointments. Has 300+ contacts scattered. Wants ONE app to: 1) Track all business contacts, 2) Link contacts to projects, 3) Book appointments, 4) Import contacts from phone so he doesn't type all 300 again. Said "I want to see which contact gave me which project and when is next meeting."

## 3. Requirement Transformation

**Raw Client Statement (faithful):**
"I want an app to track my business, contacts, projects and also be able to book appointments there and can also import contacts into it."

**Derived Artifacts:**

**a) Testable Functional Requirement (FR-02):**
FR-02: System shall allow user to import contacts from CSV/vCard file containing name, phone, email, and shall create contact records, skipping invalid phone formats and reporting count of imported vs skipped within 5 seconds for up to 500 contacts.

**b) Measurable NFR:**
NFR-U01 Usability & Performance: Contact import of 500 contacts shall complete in <5 seconds, and user shall be able to create appointment linked to contact and project in <=3 clicks.

**c) User Story:**
As a Business Owner, I want to import my phone contacts into the app and link them to projects and appointments, so that I can track my entire business in one place without re-typing.

**d) Acceptance Criteria (4):**
AC1: Given valid CSV with columns name,phone,email, When user uploads file, Then system creates contacts and shows "Imported 250, Skipped 5 invalid".
AC2: Given contact exists already with same phone, When importing, Then system detects duplicate and shows "Duplicate - skip or merge?" option.
AC3: Given imported contact, When user creates project, Then user can select contact as Client from dropdown of imported contacts.
AC4: Given project and contact selected, When user books appointment, Then appointment shows in calendar linked to both contact and project, with reminder.

**e) API/Interface Implication:**
POST /api/v1/contacts/import (multipart file), GET /api/v1/contacts, POST /api/v1/projects with contactId, POST /api/v1/appointments with contactId and projectId. UI: Contacts > Import Button > Preview > Confirm.

**f) Data Implication:**
Tables: contacts (id, name, phone UNIQUE, email, source: manual/imported), projects (id, name, contact_id FK, status, deadline), appointments (id, contact_id FK, project_id FK, datetime, notes). Import log table: import_id, total, imported, skipped, duplicates.

**g) Test Idea:**
Test import CSV with 500 contacts including 10 duplicates + 5 invalid phones - expect 485 imported, 5 skipped, 10 duplicate prompt. Test appointment double-booking same time - should warn but allow override.

**h) Open Question:**
Should imported contacts auto-sync with phone contacts or one-time import only? What about GDPR - should app ask permission before importing?

**i) Mapping:**
Interface: Contacts Import Screen + Project Creation + Appointment Calendar. Data: contacts table with unique phone index + import log. Validation: phone regex ^\+?[0-9]{10,15}$, email optional, duplicate detection on phone. Risk: User imports wrong file with sensitive data - mitigate by preview before confirm + ability to undo last import.

## 4. Reflection (310 words)

Before interview I assumed business app is just CRM like big companies. I thought client wants complex dashboards. After conversation, I learned his problem is simpler and more painful: 300 contacts scattered across phone, WhatsApp, notebook - no single source. My assumption that he needs analytics became weaker; he needs CONSOLIDATION first.

Concrete learning: I assumed import is easy - just upload file. Client asked "will it duplicate my contacts?" I never thought about duplicate handling. This changed my requirement - I added duplicate detection and merge option, not just import.

Also I assumed contacts, projects, appointments are separate. Client said "which contact gave me which project and when is next meeting" - they are linked. This changed my data model from 3 isolated tables to FK relationships: projects.contact_id, appointments.contact_id + project_id. Without interview I would have built 3 separate lists.

I also assumed import is one-time. Open question made me think about privacy and sync - should app keep importing? This is security concern - importing phone contacts means personal data. I now need permission dialog and undo feature.

Overall, I understood requirement transformation is not translating English to code, but turning vague wish "track my business" into testable behavior: import 500 contacts in <5 sec, report skipped, prevent duplicates, link to projects in 3 clicks.

## 5. Team Evidence Links

- Team client brief: docs/00-client-brief.md (business tracker)
- Team requirements: docs/01-requirements.md (FR-02 added via PR)
- Meeting minutes: docs/meeting-minutes/2026-10-20-business-owner-interview.md
- Individual evidence folder: docs/99-individual-evidence/Plange19/IA2-client-discovery/
- Branch: ia2-Plange19-contacts-import
- Commit: IA2: add Plange19 individual evidence - business tracker import
- PR: IA2 Evidence - Plange19

## 6. AI Disclosure
Tool: Meta AI, 22 Oct 2026, for memo structure. Interview notes are real from my business owner client through our google meeting , not invented. 