-- these have not been vetted for accuracy. they are only what I remeber writing a week
-- ago when I created the tables.
CREATE TABLE urls(
	[userkey] binary(64) NOT NULL PRIMARY KEY,
	[url] char(6) NOT NULL UNIQUE
)


CREATE TABLE saves (
    [url] char(6) NOT NULL PRIMARY KEY,
	[saveData] varchar(MAX) NULL
)