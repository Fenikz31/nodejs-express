import { Request, Response } from 'express';

export default function Info ( req: Request, res: Response )  {
  console.log('info')
  res.status( 200 ).json({
    success: true,
    message: '',
    data: {
      name: process.env.npm_package_name,
      version: process.env.npm_package_version
    }
  });
}