# @csjewell-activitypub/commit-config

This implements a commitlint/commitizen setup that is halfway between
scopedcommits.com and conventionalcommits.org.

Specifically, I'm of the opinion that:

1. The type of commit that a conventional commit has, while good to know,
is better placed in a trailer than in a subject, while the scope is
important enough to be in the subject.
2. I use changesets to generate the changelog, as opposed to the git log.
See https://keepachangelog.com/en/1.1.0/

This is meant for use with the other @csjewell-activitypub packages, so while it is
set up as a package in the monorepo, it is not released as one. If a release of this
module is desired, raise an issue.



References:

https://scopedcommits.com/

https://sumnerevans.com/posts/software-engineering/stop-using-conventional-commits/







