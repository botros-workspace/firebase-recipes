import React, { useState, useEffect } from 'react'

function ReciapeForm({
  handleAddRecipe,
  handleEditRecipeCancel,
  handleUpdateRecipe,
  exisitingRecipe,
}) {
  const [name, setName] = useState('')
  const [category, setCategory] = useState('breakfast')
  const [publishDate, setPublishDate] = useState(
    new Date().toISOString().split('T')[0]
  )
  const [directions, setDirections] = useState('')
  const [ingredients, setIngredients] = useState([])
  const [ingredientName, setIngredientName] = useState('')

  const handleSubmitRecipe = (e) => {
    e.preventDefault()
    if (ingredients.length === 0) {
      alert('Add at least one ingredient!')
      return
    }
    const isPublished = new Date(publishDate) <= new Date() ? true : false
    const newRecipe = {
      name,
      category,
      directions,
      publishDate: new Date(publishDate),
      isPublished,
      ingredients,
    }
    if (exisitingRecipe) {
      handleUpdateRecipe(newRecipe, exisitingRecipe.id)
    } else {
      handleAddRecipe(newRecipe)
    }
    reset()
  }
  const handleDeleteIngrident = (item) => {
    setIngredients(ingredients.filter((i) => i !== item))
  }
  const handleAddIngredient = (e) => {
    if (e.key && e.key !== 'Enter') {
      return
    }
    e.preventDefault()
    if (!ingredientName) {
      alert('ingredient field is required!')
      return
    }
    setIngredients([...ingredients, ingredientName])
    setIngredientName('')
  }
  useEffect(() => {
    if (exisitingRecipe) {
      setName(exisitingRecipe.name)
      setCategory(exisitingRecipe.category)
      setPublishDate(exisitingRecipe.publishDate.toISOString().split('T')[0])
      setDirections(exisitingRecipe.directions)
      setIngredients(exisitingRecipe.ingredients)
    } else {
      reset()
    }
  }, [exisitingRecipe])
  function reset() {
    setName('')
    setCategory('breakfast')
    setPublishDate(new Date().toISOString().split('T')[0])
    setDirections('')
    setIngredients([])
    setIngredientName('')
  }
  return (
    <form
      onSubmit={handleSubmitRecipe}
      className='add-edit-recipe-form-container'
    >
      <h2>Add a new Recipe!</h2>
      <div className='top-form-section'>
        <div className='fields'>
          <label className='recipe-label input-label'>
            Recipe name:
            <input
              type='text'
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className='input-text'
            />
          </label>
          <label className='recipe-label input-label'>
            Category:
            <select
              className='select'
              required
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value='breakfast'>Breakfast</option>
              <option value='dessert'>Dessert</option>
              <option value='lunch'>Lunch</option>
              <option value='dinner'>Dinner</option>
            </select>
          </label>
          <label className='recipe-label input-label'>
            Directions:
            <textarea
              required
              value={directions}
              onChange={(e) => setDirections(e.target.value)}
              className='directions input-text'
            />
          </label>
          <label className='recipe-label input-label'>
            Published Date :
            <input
              type='date'
              required
              value={publishDate}
              onChange={(e) => setPublishDate(e.target.value)}
              className='input-text'
            />
          </label>
        </div>
      </div>
      <div className='ingredients-list'>
        <h3 className='text-center'>Ingredients</h3>
        <table className='ingredients-table'>
          <thead>
            <tr>
              <th className='table-header'>Ingredients</th>
              <th className='table-header'>Delete</th>
            </tr>
          </thead>
          <tbody>
            {ingredients && ingredients.length > 0
              ? ingredients.map((item) => {
                  return (
                    <tr key={item}>
                      <td className='table-data text-center'>{item}</td>
                      <td className='ingredient-delete-box'>
                        <button
                          type='button'
                          className='secondary-button ingredient-delete-button'
                          onClick={() => handleDeleteIngrident(item)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  )
                })
              : null}
          </tbody>
        </table>
        {ingredients && ingredients.length === 0 ? (
          <h3 className='text-center no-ingredients'>
            No ingredients were added yet!
          </h3>
        ) : null}
        <div className='ingredient-form'>
          <label className='ingredient-label '>
            Ingredient :
            <input
              type='text'
              onKeyPress={handleAddIngredient}
              value={ingredientName}
              onChange={(e) => setIngredientName(e.target.value)}
              className='input-text'
              placeholder='1 cup of butter'
            />
          </label>
          <button
            type='button'
            onClick={handleAddIngredient}
            className='primary-button add-ingredient-button'
          >
            Add
          </button>
        </div>
      </div>
      <div className='action-buttons'>
        <button type='submit' className='primary-button action-button'>
          {exisitingRecipe ? 'Update Recipe' : 'Create Recipe'}
        </button>
        {exisitingRecipe ? (
          <button
            type='button'
            onClick={handleEditRecipeCancel}
            className='primary-button action-button'
          >
            Cancel
          </button>
        ) : null}
      </div>
    </form>
  )
}

export default ReciapeForm
