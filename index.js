const express = require('express')
const mongoose = require('mongoose')
require('ejs')
const Session = require('express-session')
const MongoDbSession = require('connect-mongodb-session')(Session)
const app = express()
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.set('view engine', 'ejs')


//port listens
const port = 5000
app.listen(port, () => {
    console.log('server runing on port: ', port)
})
//mongodb connection
mongoose.connect('mongodb+srv://akilanithila:akila2004@cluster0.ck0ia.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0')
    .then(() => console.log('server connected'))
    .catch((error) => console.log('server not connected', error))
//connect mongodb session
const Store = new MongoDbSession({
    uri: "mongodb+srv://akilanithila:akila2004@cluster0.ck0ia.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0",
    collection: 'session'
})
app.use(Session({
    secret: 'maki-key',
    resave: false,
    saveUninitialized: false,
    store: Store
}))

//login page render
app.get('/login', (req, res) => {
    res.render('login')
})

//login page render
app.get('/login-page', (req, res) => {
    res.render('login')
})

//sign up pader render
app.get('/signup', (req, res) => {
    res.render('signup')
})

//admin register pader render
app.get('/adminreg', (req, res) => {
    res.render('adminreg')
})


//userpage and homepage
app.get('/', async (req, res) => {
    let authname;
    const authStatus = req.session.user
    // console.log('session',req.session.user)
    if (authStatus) {
        const finduser = await model.findOne({ name: req.session.user })
        if (finduser) {
            authname = finduser.name

        }
        else {
            authname = 'Guest'
        }
    }
    else {
        authname = 'Guest'
    }
    const books = await bookmodel.find({})

    return res.render('home', { books, authname })
})




//read user page
app.get('/read/:id', async (req, res) => {
    try {
        let authname;
        const authStatus = req.session.user
        // console.log('session',req.session.user)
        if (authStatus) {
            const finduser = await model.findOne({ name: req.session.user })
            if (finduser) {
                authname = finduser.name
                const books = await bookmodel.findById(req.params.id); // Fetch book by ID
                return res.render("readbook", { books, authname });

            }
            else {
                return res.render('login')
            }
        }
        else {
            return res.render('bookfail', { message: 'Please Register and Read the Book!. ' })
        }

    } catch (err) {
        res.status(500).send("Error fetching book for update");
    }
})

//User Schema for mongodb
const userSchema = mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }
})

//collection for User Schema 
const model = mongoose.model('aki_user', userSchema)


//user register
app.post('/sign', async (req, res) => {
    try {
        const { username, email, password } = req.body
        if (username && email && password) {
            const finduser = await model.findOne({ email: email })
            if (finduser) {
                return res.render('fail', { message: 'This username Already Resgister! ' })
            }
            else {
                const temp = new model({
                    name: username,
                    email: email,
                    password: password
                })
                const datasave = await temp.save()
                if (datasave) {
                    return res.render('success', { message: "User Registration successfully!" })
                }
                else {
                    return res.render('fail', { message: "User Registration failed!" })
                }
            }

        }
        else {
            return res.render('fail', { message: "Please provide all details!" })
        }
    }
    catch (err) {
        console.log('Error in registration: ', err)
        return res.send({ success: false, message: "Trouble in Student Registration, please contact support team!" })
    }
})

//book database schema
const bookSchema = mongoose.Schema({
    img: { type: String, required: true },
    bookName: { type: String, required: true },
    author: { type: String, required: true },
    description: { type: String, required: true },
    story: { type: String, required: true },
    rating: { type: String, required: true },
    price: { type: String, required: true }
})

//bookmodel for book schema
const bookmodel = mongoose.model('books_list', bookSchema)

//update book page render
app.get('/updatebook', (req, res) => {
    res.render('bookupdate')
})

//add book page render
app.get('/addbook', (req, res) => {
    res.render('addbook')
})
//add book 
app.post('/addbooks', async (req, res) => {
    try {
        const { img, bookName, author, description, story, rating, price } = req.body
        if (img && bookName && author && description && story && rating && price) {
            const temp = new bookmodel({
                img: img,
                bookName: bookName,
                author: author,
                description: description,
                story: story,
                rating: rating,
                price: price
            })
            const datasave = await temp.save()
            if (datasave) {
                return res.render('bookok', { message: "book added" })

            }
            else {
                return res.render('bookok', { message: "book not added" })

            }
        }
        else {
            return res.send({ success: false, message: "Please provide all details!" })
        }
    }
    catch (err) {
        console.log('Error in registration: ', err)
        return res.send({ success: false, message: "Trouble in Book  Added , please contact support team!" })
    }
})


//Adminehome page
app.get('/AdminHome', async (req, res) => {
    try{
        let authname;
        const authStatus = req.session.user
        // console.log('session',req.session.user)
        if (authStatus) {
            const finduser = await adminModel.findOne({adminName: req.session.user })
            if (finduser) {
                authname = finduser.adminName
    
            }
            else {
                authname = 'Guest'
            }
        }
        else {
            authname = 'Guest'
        }
    const books = await bookmodel.find({})
    console.log(books)
    return res.render('AdminHome', { books,authname })
    }
    catch (err) {
        res.status(500).send("Error fetching book for update");
    }
})

//Admin update book using book id to fetch
app.get("/update/:id", async (req, res) => {
    try {
        const book = await bookmodel.findById(req.params.id); // Fetch book by ID
        res.render("bookupdate", { book }); // Pass the book to the update page
    } catch (err) {
        res.status(500).send("Error fetching book for update");
    }
});
//Admin update book using book id 
app.post("/update/:id", async (req, res) => {
    try {
        const { bookName, author, description, rating, price,story } = req.body;
        await bookmodel.findByIdAndUpdate(req.params.id, { bookName, author, description, rating, price,story });
        res.redirect("/adminhome"); // Redirect back to the home page
    } catch (err) {
        res.status(500).send("Error updating book");
    }
});

//Admin delete book using book id 
app.post("/delete/:id", async (req, res) => {
    try {
        await bookmodel.findByIdAndDelete(req.params.id); // Delete the book
        res.redirect("/adminhome"); // Redirect back to the home page
    } catch (err) {
        res.status(500).send("Error deleting book");
    }
});

//login process
app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body
        if (email && password) {
            const fetchemail = await model.findOne({ email: email })
            console.log(fetchemail)
            if (fetchemail) {
                if (fetchemail.password === password) {
                    req.session.user = fetchemail.name
                    return res.render('success', { message: "login successfully" })
                }
                else {
                    return res.render('fail', { message: "Please provide correct password!" })
                }
            }
            else {
                return res.render('fail', { message: "Please provide correct email!" })
            }
        }
        else {
            return res.render('fail', { message: "Please provide all details!" })
        }

    } catch (err) {
        res.status(500).send("Error deleting book");
    }
})
//logout user
app.get('/logout', (req, res) => {
    try {
        req.session.destroy((err) => {
            if (err) {
                return console.log(err)
            } else {
                return res.redirect('/')
            }
        })
    } catch (err) {
        res.status(500).send("Error deleting book");
    }
})


//admin register
const adminreg = mongoose.Schema({
    adminName: { type: String, required: true },
    adminEmail: { type: String, required: true, unique: true },
    adminPassword: { type: String, required: true },
    role: { type: String, required: true }
})
const adminModel = mongoose.model('admin_register', adminreg)
app.post('/adminreg', async (req, res) => {
    try {
        const { name, email, password, role } = req.body

        if (name && email && password && role) {
            const finduser = await adminModel.findOne({ adminEmail: email })
            if (finduser) {
                return res.render('fail', { message: 'This username Already Resgister! ' })
            }
            else {
                const admin = new adminModel({
                    adminName: name,
                    adminPassword: password,
                    adminEmail: email,
                    role: role
                })
                const datasave = await admin.save()
                if (datasave) {
                    
                    return res.redirect('/AdminHome')
                } else {
                    return res.render('fail', { message: 'Admin Register is failed' })
                }
            }
        }
        else {
            return res.render('fail', { message: 'Provide all Details' })
        }

    } catch (err) {
        res.status(500).send("Error  book");
    }
})


