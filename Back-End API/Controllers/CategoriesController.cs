using AngularProject.Data;
using AngularProject.Models;
using FluentValidation;
using FluentValidation.Results;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AngularProject.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]

    public class CategoriesController : ControllerBase
    {
        private readonly IValidator<Category> _validator;
        private readonly ApplicationDbContext _context;
        public CategoriesController(IValidator<Category> validator, ApplicationDbContext context)
        {
            _validator = validator;
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetCategories()
        {
            try
            {
                var categories = await _context.Category.ToListAsync();
                return Ok(categories);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }

        }
        [HttpGet("{id}")]
        public async Task<IActionResult> GetCategoryById(int id)
        {
            try
            {
                var result = await _context.Category.FindAsync(id);

                if (result == null)
                {
                    return NotFound();
                }
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPost]
        public async Task<IActionResult> SaveCategory([FromBody] Category category)
        {
            try
            {
                ValidationResult validationResult = await _validator.ValidateAsync(category);
                if (!validationResult.IsValid)
                {
                    foreach (var error in validationResult.Errors)
                    {
                        ModelState.AddModelError(error.PropertyName, error.ErrorMessage);
                    }
                    return ValidationProblem(ModelState);
                }

                await _context.Category.AddAsync(category);
                await _context.SaveChangesAsync();
                return Ok(category);

            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateCategory(int id, [FromBody] Category category)
        {
            try
            {
                ValidationResult validationResult = await _validator.ValidateAsync(category);
                if (!validationResult.IsValid)
                {
                    foreach (var errors in validationResult.Errors)
                    {
                        ModelState.AddModelError(errors.PropertyName, errors.ErrorMessage);
                    }
                    return ValidationProblem(ModelState);
                }

                var result = await _context.Category.FindAsync(id);
                if (result == null)
                {
                    return NotFound();
                }
                result.CategoryName = category.CategoryName;
                await _context.SaveChangesAsync();
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCategory(int id)
        {
            try
            {
                var result = await _context.Category.FindAsync(id);
                if (result == null)
                {
                    return NotFound();
                }
                _context.Category.Remove(result);
                await _context.SaveChangesAsync();
                return Ok(result);

            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}

