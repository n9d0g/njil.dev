# Subscriber document ids are derived from the email

A Subscriber's Sanity `_id` is a hash of their normalised email, not a random id. Saving is then a `createOrReplace` on a known id, so two simultaneous sign-ups for the same address can't create duplicate Subscribers; with random ids, the read-then-create in subscribe races. Existing Subscribers are moved to derived ids by a one-off migration. Changing the normalisation rule (e.g. stripping `+tags`) changes ids, so it needs another migration.
