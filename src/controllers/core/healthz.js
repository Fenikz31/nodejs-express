export default function Healthz () {
  return ( req, res ) => {
    res.sendStatus( 200 );
  }
}