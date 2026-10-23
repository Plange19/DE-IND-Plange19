// Idempotency check via X-Request-Id
db.imports.findOne({requestId: "550e8400-e29b-41d4-a716-446655440000"})