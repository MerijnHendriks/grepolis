using System.Windows;
using System.Windows.Controls;
using Game.Client.Utils;

namespace Game.Client.Views
{
    /// <summary>
    /// Interaction logic for MainMenu.xaml
    /// </summary>
    public partial class MainMenuView : UserControl
    {
        public MainMenuView()
        {
            InitializeComponent();
        }

        private void loginButton_Click(object sender, RoutedEventArgs e)
        {
            if (loginUsername.Text == "username" && loginPassword.Text == "password")
            {
                ViewUtil.Switch(new CityView());
            }
        }
    }
}
