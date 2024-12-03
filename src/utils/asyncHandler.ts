import { NextFunction, Request, Response } from "express";

type RequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<any>;


export const asyncHandler =
  (requestHandler: RequestHandler) =>
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      return await requestHandler(req, res, next);
    } catch (error:any) {
      next(error);
    }
  };
