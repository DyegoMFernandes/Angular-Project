using System.ComponentModel.DataAnnotations.Schema;

namespace AngularProject.Models
{
    [Table("Categories")]
    public class Category
    {
        public int CategoryID { get; set; }
        public string CategoryName { get; set; } = string.Empty;

    }
}
