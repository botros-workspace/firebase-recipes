import { useState, useEffect } from 'react'
import FirebaseAuthService from './FirebaseAuthService'
import FirebaseFirestoreService from './FirebaseFirestoreService'
import './App.scss'
import LoginForm from './components/LoginForm'
import ReciapeForm from './components/ReciapeForm'
function App() {
  const [user, setUser] = useState(null)
  const [recipes, setRecipes] = useState([])
  const [currentRecipe, setCurrentRecipe] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [categoryFilter, setCategoryFilter] = useState('')
  const [orderBy, setOrderBy] = useState('publishDateDesc')
  const [recipesPerPage, setRecipesPerPage] = useState(3)

  useEffect(() => {
    setIsLoading(true)
    fetchRecipes()
      .then((recipes) => {
        setRecipes(recipes)
      })
      .catch((error) => {
        console.log(error.message)
        throw error
      })
      .finally(() => setIsLoading(false))
  }, [user, categoryFilter, orderBy, recipesPerPage])

  const handleRecipesPerPagechange = (e) => {
    const amount = e.target.value
    setRecipes([])
    setRecipesPerPage(amount)
  }

  const handleLoadMoreRecipesClick = () => {
    const lastRecipe = recipes[recipes.length - 1]
    const cursorId = lastRecipe.id
    handleFetchRecipes(cursorId)
  }

  const handleFetchRecipes = async (cursorId = '') => {
    try {
      const data = await fetchRecipes(cursorId)
      setRecipes(data)
    } catch (error) {
      console.log(error.message)
      throw error
    }
  }
  const fetchRecipes = async (cursorId = '') => {
    const queries = []
    if (categoryFilter) {
      queries.push({
        field: 'category',
        condition: '==',
        value: categoryFilter,
      })
    }
    if (!user) {
      queries.push({
        field: 'isPublished',
        condition: '==',
        value: true,
      })
    }
    const orderByField = 'publishDate'
    let orderByDirection

    if (orderBy) {
      switch (orderBy) {
        case 'publishDateAsc':
          orderByDirection = 'asc'
          break
        case 'publishDateDesc':
          orderByDirection = 'desc'
          break
        default:
          break
      }
    }
    let data = []

    try {
      const response = await FirebaseFirestoreService.readDocuments(
        'recipes',
        queries,
        orderByField,
        orderByDirection,
        recipesPerPage,
        cursorId
      )
      const newRecipes = response.docs.map((recipe) => {
        const id = recipe.id
        const data = recipe.data()
        data.publishDate = new Date(data.publishDate.seconds * 1000)
        return { ...data, id }
      })
      if (cursorId) {
        data = [...recipes, ...newRecipes]
      } else {
        data = [...newRecipes]
      }
    } catch (error) {
      console.log(error.message)
      throw error
    }
    return data
  }
  FirebaseAuthService.subscribeToAuthChanges(setUser)

  const handleAddRecipe = async (newRecipe) => {
    try {
      const response = await FirebaseFirestoreService.createDocument(
        'recipes',
        newRecipe
      )
      handleFetchRecipes()
      alert(`Recipe with the id: ${response.id} was succesfully added!`)
    } catch (error) {
      alert(error.message)
    }
  }

  const handleUpdateRecipe = async (newRecipe, recipeId) => {
    try {
      await FirebaseFirestoreService.updateDocument(
        'recipes',
        recipeId,
        newRecipe
      )
      handleFetchRecipes()
      alert(`successfully updated a recipe with an ID ${recipeId}`)
      setCurrentRecipe(null)
    } catch (error) {
      alert(error.message)
      throw error
    }
  }
  const handleEditRecipeClick = (recipeId) => {
    const selectedRecipe = recipes.find((item) => {
      return item.id === recipeId
    })
    if (selectedRecipe) {
      setCurrentRecipe(selectedRecipe)
      window.scrollTo(0, document.body.scrollHeight)
    }
  }
  const handleRecipeDelete = async (id) => {
    const deleteConfirm = window.confirm(
      'Are you sure you want to delete that recipe?'
    )
    if (deleteConfirm) {
      try {
        await FirebaseFirestoreService.deleteDocument('recipes', id)
        handleFetchRecipes()
        alert(`successfully deleted a recipe with an ID ${id}`)
      } catch (error) {
        alert(error.message)
        throw error
      }
    }
  }
  const handleEditRecipeCancel = () => {
    setCurrentRecipe(null)
  }
  const lookupLabel = (category) => {
    const categories = {
      breakfast: 'Breakfast',
      dessert: 'Dessert',
      lunch: 'Lunch',
      dinner: 'Dinner',
    }
    const label = categories[category]
    return label
  }
  const dateFormat = (date) => {
    const day = date.getUTCDate()
    const month = date.getUTCMonth()
    const year = date.getFullYear()
    const string = `${month}-${day}-${year}`
    return string
  }
  return (
    <div className='App'>
      <div className='title-row'>
        <h1 className='title'>Recipes</h1>
        <LoginForm existingUser={user}></LoginForm>
      </div>
      <div className='main'>
        <div className='row filters'>
          <label className='recipe-label input-label'>
            Category:
            <select
              className='select'
              required
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value=''></option>
              <option value='breakfast'>Breakfast</option>
              <option value='dessert'>Dessert</option>
              <option value='lunch'>Lunch</option>
              <option value='dinner'>Dinner</option>
            </select>
          </label>
          <label className=' input-label'>
            <select
              className='select'
              required
              value={orderBy}
              onChange={(e) => setOrderBy(e.target.value)}
            >
              <option value='publishDateAsc'>oldest - newst</option>
              <option value='publishDateDesc'>newst - oldest</option>
            </select>
          </label>
        </div>
        <div className='center'>
          <div className='recipe-list-box'>
            {isLoading ? (
              <div className='fire'>
                <div className='flames'>
                  <div className='flame'></div>
                  <div className='flame'></div>
                  <div className='flame'></div>
                  <div className='flame'></div>
                </div>
                <div className='logs'></div>
              </div>
            ) : null}
            {!isLoading && recipes && recipes.length === 0 ? (
              <h5 className='no-recipes'>No recipes were found</h5>
            ) : null}
            {!isLoading && recipes && recipes.length > 0 ? (
              <div className='recipe-list'>
                {recipes.map((recipe) => {
                  return (
                    <div className='recipe-card' key={recipe.id}>
                      {recipe.isPublished === false ? (
                        <div className='unpublished'>UNPUBLISHED</div>
                      ) : null}
                      <div className='recipe-name'>{recipe.name}</div>
                      <div className='recipe-field'>
                        Category : {lookupLabel(recipe.category)}
                      </div>
                      <div className='recipe-field'>
                        Publish Date : {dateFormat(recipe.publishDate)}
                      </div>
                      {user ? (
                        <>
                          {' '}
                          <button
                            onClick={() => handleEditRecipeClick(recipe.id)}
                            className='primary-button edit-button'
                          >
                            EDIT
                          </button>
                          <button
                            onClick={() => handleRecipeDelete(recipe.id)}
                            className='primary-button edit-button'
                          >
                            DELETE
                          </button>
                        </>
                      ) : null}
                    </div>
                  )
                })}
              </div>
            ) : null}
          </div>
        </div>
        {isLoading || (recipes && recipes.length > 0) ? (
          <>
            <label className='input-label'>
              Recipes Per Page:
              <select
                value={recipesPerPage}
                onChange={handleRecipesPerPagechange}
                className='select'
              ></select>
            </label>
          </>
        ) : null}
        {user ? (
          <ReciapeForm
            exisitingRecipe={currentRecipe}
            handleAddRecipe={handleAddRecipe}
            handleUpdateRecipe={handleUpdateRecipe}
            handleEditRecipeCancel={handleEditRecipeCancel}
          ></ReciapeForm>
        ) : null}
      </div>
    </div>
  )
}

export default App
