
class Env {
    SERVER_URL: string
    JWT_SECRET_KEY: string

    constructor() {
        this.SERVER_URL = process.env.NODE_ENV === 'development' ? "http://localhost:8000" : "-"
        this.JWT_SECRET_KEY = process.env.JWT_SECRET_KEY || ''
    }
}

export const env = new Env()