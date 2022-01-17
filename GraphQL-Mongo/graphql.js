const express = require("express")
const expressGraphQL = require("express-graphql").graphqlHTTP
const {request} = require("graphql-request")
const s = require( "./server.js")
const  subscriber = require( "./models/subscriber.js")



const {
    GraphQLSchema,
    GraphQLObjectType,
    GraphQLString,
    GraphQLList,
    GraphQLInt,
    GraphQLNonNull
}=require("graphql")

const app=express()
//Some Data to Learn
// const users = [
//  	{ id: 1, username: 'Aldo', email: "golosa69@hotmail.com" },
//  	{ id: 2, username: 'Cao', email: "boladefuego@hotmail.com" },
//  	{ id: 3, username: 'Dios', email: "naruto93@hotmail.com" },
//  	{ id: 4, username: 'Papi', email: "licValeriano@hotmail.com" }
//  ]
//console.log(Subscriber)


const userType=new GraphQLObjectType({
    name: "user",
    description: "This represents a user",
    fields:()=>({
        username:{type: GraphQLNonNull(GraphQLString)},
        email:{type: GraphQLNonNull(GraphQLString)}
    })
})

//Defining the schema



const RootQueryType = new GraphQLObjectType({
    name:"Query",
    description: "Root Query",
    fields:()=>({
        user:{
            type: userType, //A planew subscriber(ce holder of the Actual Data
            description: "A single user",
            args:{
                email:{type:GraphQLString}
            },
            resolve: async(parent, args)=> {
                const user = await subscriber.findOne({email: args.email})
                return user
            }
        },
        users: {
            type: new GraphQLList(userType), //A place holder of the Actual Data
            description: "List of All users",
            resolve: ()=> subscriber.find()
        }
       
    })
})

 const RootMutationtype=new GraphQLObjectType({
     name: "Mutation",
     description:"Root Mutation",
     fields:()=>({
         addUser:{
             type:userType,
             description: "Add a new user",
             args:{
                 username:{type: GraphQLNonNull(GraphQLString)},
                 email:{type: GraphQLNonNull(GraphQLString)}
             },
             resolve: async(parent, args) =>{
                 if (await subscriber.exists({email:args.email})){
                    return;
                }

                 const user = await new subscriber({username: args.username, email:args.email})
                 user.save()
                 return user
             }
         },
         deleteUser:{
            type:userType,
            description: "Add a new user",
            args:{
                email:{type: GraphQLNonNull(GraphQLString)}
            },
            resolve: async(parent, args)=> {
                const user = await subscriber.findOneAndDelete({email: args.email})
                console.log(user)
                return user[0]
            }
         }
        //  updateUser:{
        //      type:userType,
        //      description:"Update user",
        //      args:{
        //          id:{type:GraphQLNonNull(GraphQLString)},

        //      }
        //  }
     })
 })

const schema= new GraphQLSchema({
    query: RootQueryType,
    mutation: RootMutationtype
})

const myQuerie=`query{users{username}}`
const mutQuerie=`mutation{addUser(username:"Lolis",email:"ombridge"){username}}`


//request("http://localhost:3200/",mutQuerie)

 app.use("/", expressGraphQL({
     schema: schema,
     graphiql :true // Actual User interface
 }))
app.listen(3200, ()=>console.log("server running in port 3200"))