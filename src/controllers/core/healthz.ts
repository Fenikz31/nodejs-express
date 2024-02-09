import express, { Request, Response } from "express";

export default function Healthz ( req: Request, res: Response ) {
  res.sendStatus( 200 );
}