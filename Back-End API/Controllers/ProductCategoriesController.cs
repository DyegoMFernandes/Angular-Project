using AngularProject.Data;
using AngularProject.Models;
using FluentValidation;
using FluentValidation.Results;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AngularProject.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]

    public class ProductCategoryController : ControllerBase
    {
        readonly ApplicationDbContext _context;
        readonly IValidator<ProductCategory> _validator;
        public ProductCategoryController(ApplicationDbContext context, IValidator<ProductCategory> validator)
        {
            _context = context;
            _validator = validator;
        }

        [HttpGet]
        public IActionResult GetProductCategories()
        {
            try
            {
                return Ok(_context.ProductCategory.ToList());
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPost]
        public async Task<IActionResult> CreateProductCategory([FromBody] ProductCategory productCategory)
        {
            try
            {
                ValidationResult validationResult = await _validator.ValidateAsync(productCategory);
                if (!validationResult.IsValid)
                {
                    foreach (var error in validationResult.Errors)
                    {
                        ModelState.AddModelError(error.PropertyName, error.ErrorMessage);
                    }
                    return ValidationProblem(ModelState);
                }
                await _context.ProductCategory.AddAsync(productCategory);
                await _context.SaveChangesAsync();
                return Ok(productCategory);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpDelete("{productId:int}/{categoryId:int}")]
        public async Task<IActionResult> DeleteProductCategory(int productId, int categoryId)
        {
            try
            {
                var productCategory = await _context.ProductCategory.FindAsync(productId, categoryId);

                if (productCategory == null)
                {
                    return NotFound();
                }


                _context.ProductCategory.Remove(productCategory);
                await _context.SaveChangesAsync();
                return Ok(productCategory);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

    }
}
