using AngularProject.Data;
using AngularProject.Models;
using FluentValidation;
using FluentValidation.Results;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AngularProject.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]

    public class ProductsController : ControllerBase
    {
        readonly ApplicationDbContext _context;
        readonly IValidator<Product> _validator;
        public ProductsController(ApplicationDbContext context, IValidator<Product> validator)
        {
            _context = context;
            _validator = validator;
        }

        [HttpGet]
        public async Task<ActionResult<List<Product>>> GetProducts()
        {
            try
            {
                return Ok(await _context.Product.ToListAsync());
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
        [HttpGet("{id}")]
        public async Task<IActionResult> GetProductById(int id)
        {
            try
            {
                var product = await _context.Product.FindAsync(id);
                if (product == null)
                {
                    return NotFound();
                }
                return Ok(product);

            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateProduct(int id, [FromBody] Product product)
        {
            try
            {
                ValidationResult validationResult = await _validator.ValidateAsync(product);

                if (!validationResult.IsValid)
                {
                    foreach (var error in validationResult.Errors)
                    {
                        ModelState.AddModelError(error.PropertyName, error.ErrorMessage);
                    }
                    return ValidationProblem(ModelState);
                }

                var results = await _context.Product.FindAsync(id);

                if (results == null)
                {
                    return NotFound();
                }
                results.ProductName = product.ProductName;
                results.Description = product.Description;
                results.Price = product.Price;
                results.Description = product.Description;

                await _context.SaveChangesAsync();
                return Ok(results);

            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPost]
        public async Task<IActionResult> CreateProduct([FromBody] Product product)
        {
            try
            {
                ValidationResult validationResult = await _validator.ValidateAsync(product);
                if (!validationResult.IsValid)
                {
                    foreach (var error in validationResult.Errors)
                    {
                        ModelState.AddModelError(error.PropertyName, error.ErrorMessage);
                    }
                    return ValidationProblem(ModelState);
                }
                await _context.Product.AddAsync(product);
                await _context.SaveChangesAsync();

                var stock = new Stock
                {
                    ProductID = product.ProductID,
                    Quantity = 100
                };

                await _context.Stock.AddAsync(stock);
                await _context.SaveChangesAsync();

                return Ok(product);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }


        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteProduct(int id)
        {
            try
            {
                var product = await _context.Product.FindAsync(id);
                if (product == null)
                {
                    return NotFound();
                }
                _context.Product.Remove(product);
                await _context.SaveChangesAsync();
                return Ok(product);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}
