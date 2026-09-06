// ElectionInfo + ElectionCandidate types together here

export type IElectionFilters = {
	searchTerm?: string;
	status?: string;
};

export type ICandidatePayload = {
	electionId: string;
	name: string;
	position: string;
	photoUrl?: string;
	manifesto?: string;
};
