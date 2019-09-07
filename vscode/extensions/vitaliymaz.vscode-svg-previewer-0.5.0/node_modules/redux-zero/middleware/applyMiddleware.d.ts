import Store from "../interfaces/Store";
export default function applyMiddleware(...middlewares: any[]): (store: Store, action: Function, args: any) => any;
