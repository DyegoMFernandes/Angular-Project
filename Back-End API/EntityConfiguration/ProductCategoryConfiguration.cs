using AngularProject.Data;
using AngularProject.Models;
using FluentValidation;

namespace Enquiry_App.EntityConfiguration
{
    public class ProductCategoryConfiguration : AbstractValidator<ProductCategory>
    {
        private readonly ApplicationDbContext _context;
        public ProductCategoryConfiguration(ApplicationDbContext context)
        {
            _context = context;
        }
    }
}
