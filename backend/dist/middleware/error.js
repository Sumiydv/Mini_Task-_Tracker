export function notFound(req, res) {
    return res.status(404).json({ message: 'Not Found' });
}
export function errorHandler(err, req, res, next) {
    console.error(err);
    return res.status(500).json({ message: 'Server Error' });
}
