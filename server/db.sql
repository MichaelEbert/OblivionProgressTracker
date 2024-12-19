-- these have not been vetted for accuracy. they are only what I remeber writing a week
-- ago when I created the tables.
CREATE TABLE urls(
	[userkey] binary(64) NOT NULL PRIMARY KEY,
	[url] char(6) NOT NULL UNIQUE
)

-- could probably use a foreign key...
CREATE TABLE saves (
    [url] char(6) NOT NULL PRIMARY KEY,
	[saveData] JSON NULL,
	[accessed] datetime NULL
)

--create role that has access to urls and saves, and can write to ips, but not read ips. (TODO: ips table)
CREATE ROLE normalReaderWriter;
GO;
GRANT INSERT, SELECT, UPDATE ON [urls] TO normalReaderWriter;
GRANT INSERT, SELECT, UPDATE ON [saves] TO normalReaderWriter;

