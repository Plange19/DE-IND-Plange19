// Find duplicate emails in import - validation before save
db.contacts.aggregate([
  {$match: {teamId: "team_plange19_001", importId: "imp_1222321_001"}},
  {$group: {_id: "$email", count: {$sum:1}}},
  {$match: {count: {$gt:1}}}
])