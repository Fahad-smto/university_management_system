import { Request, Response } from "express";
// import catchAsync from '../../shared/catchAsync';
// import sendResponse from '../../shared/sendResponse';
// import pick from '../../shared/pick';
// import { electionService } from './election.service';

// ElectionInfo + ElectionCandidate controller functions live together here
// since candidates only ever exist in the context of an election.

export const electionController = {
	// ---- ElectionInfo (info-only, no on-site voting) ----
	// createElection: catchAsync(async (req: Request, res: Response) => {}),
	// getAllElections: catchAsync(async (req: Request, res: Response) => {}),
	// getSingleElection: catchAsync(async (req: Request, res: Response) => {}),
	// updateElection: catchAsync(async (req: Request, res: Response) => {}),
	// softDeleteElection: catchAsync(async (req: Request, res: Response) => {}),
	// ---- ElectionCandidate (display-only list, no voting logic) ----
	// addCandidate: catchAsync(async (req: Request, res: Response) => {}),
	// getCandidates: catchAsync(async (req: Request, res: Response) => {}),
	// updateCandidate: catchAsync(async (req: Request, res: Response) => {}),
	// removeCandidate: catchAsync(async (req: Request, res: Response) => {}),
};
