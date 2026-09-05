type IGenericErrorResponse = {
  statusCode: number;
  message: string;
  errorMessages: { path: string | number; message: string }[];
};

// TODO: branch on Prisma error codes
// P2002 -> unique constraint violation
// P2025 -> record not found
// P2003 -> foreign key constraint failed
export const handlePrismaError = (error: any): IGenericErrorResponse => {
  return {
    statusCode: 400,
    message: 'Database Error',
    errorMessages: [],
  };
};

export default handlePrismaError;
