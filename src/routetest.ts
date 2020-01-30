import { Route } from "./decorator";

export class RouteTest{
    @Route()
    m1(){
        console.log('m1 is called');
    }
}

