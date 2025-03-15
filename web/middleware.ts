import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

export async function middleware(request: NextRequest) {
    
    if (request.nextUrl.pathname === '/login') {
        return NextResponse.next()
    }

    const token = request.cookies.get('auth_token')

    if (!token) {
        
        return NextResponse.redirect(new URL('/login', request.url))
    
    } else {

        try { 

            const { payload } = await jwtVerify(token.value, new TextEncoder().encode(process.env.JWT_SECRET_KEY!))

            console.log("the payload", payload)
            
            const headers = new Headers(request.headers)

            headers.set("x-userEmail", Object(payload).email)

            return NextResponse.next({
                headers: headers
            })

        } catch (error) {
            console.error(error)
            return NextResponse.redirect(new URL('/login', request.url))
        }
    }
}

export const config = {
    matcher: '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)'
}