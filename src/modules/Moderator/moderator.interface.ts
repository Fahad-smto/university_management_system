// Moderator (panel) + ModeratorMember types together here

export type IModeratorFilters = {
	searchTerm?: string;
	status?: string;
};

export type IModeratorMemberPayload = {
	moderatorId: string;
	userId: string;
	position: string;
};
