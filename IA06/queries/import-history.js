// Get last imports for team - for UI history
db.imports.find({teamId: "team_plange19_001"}).sort({createdAt:-1}).limit(10)