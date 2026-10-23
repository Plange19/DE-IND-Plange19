IA06 Data Model - Flowvantage Contact Import
 DE-SEGP-24
Project: Flowvantage - Contact Management

Entities
1. User: _id, email(unique), name, role(ADMIN|MANAGER|STAFF), teamId
2. Team: _id, name, ownerId, createdAt
3. Contact: _id, email, name, phone, teamId(ref Team), source(MANUAL|CLIENT_LIST), importId, createdBy(ref User), createdAt
4. Import: _id, teamId, fileName, requestId(unique, X-Request-Id), status(COMPLETED|FAILED), importedCount, skippedCount, createdBy, createdAt, TTL 24h for idempotency

Relationships
- Team 1--* User (owner)
- Team 1--* Contact (teamId)
- Team 1--* Import (teamId)
- User 1--* Contact (createdBy)
- User 1--* Import (createdBy)
- Import 1--* Contact (importId)

 Indexes
- Contact: {teamId:1, email:1} unique
- Contact: {teamId:1, importId:1}
- Import: {requestId:1} unique, {createdAt:1} expireAfterSeconds 86400
- User: {email:1} unique, {teamId:1}

 NFR
- Query <500ms for 100 contacts per team
- Synthetic data only, no PII

 Trade-off
- MongoDB vs SQL: Mongo for flexible CSV mapping, trade-off no JOIN, use aggregation

Video: https://youtube.com/shorts/ibMp2fG4Ybs (timestamp IA06 09:30-13:00)