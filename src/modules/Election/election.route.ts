import { Router } from 'express';
// import auth from '../../middlewares/auth';
// import validateRequest from '../../middlewares/validateRequest';
// import { electionController } from './election.controller';
// import { electionValidation } from './election.validation';

const router = Router();

// ---- ElectionInfo routes ----
// router.post('/', validateRequest(electionValidation.createElectionZod), auth('ADMIN', 'MODERATOR'), electionController.createElection);
// router.get('/', electionController.getAllElections);
// router.get('/:id', electionController.getSingleElection);
// router.patch('/:id', validateRequest(electionValidation.updateElectionZod), auth('ADMIN', 'MODERATOR'), electionController.updateElection);
// router.delete('/:id', auth('ADMIN'), electionController.softDeleteElection);

// ---- ElectionCandidate routes (nested under an election) ----
// router.post('/:electionId/candidates', validateRequest(electionValidation.createCandidateZod), auth('ADMIN', 'MODERATOR'), electionController.addCandidate);
// router.get('/:electionId/candidates', electionController.getCandidates);
// router.patch('/candidates/:candidateId', auth('ADMIN', 'MODERATOR'), electionController.updateCandidate);
// router.delete('/candidates/:candidateId', auth('ADMIN', 'MODERATOR'), electionController.removeCandidate);

export const ElectionRoutes = router;
