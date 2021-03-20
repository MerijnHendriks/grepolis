using System.Windows;
using Game.Client.Utils;
using Game.Client.Views;

namespace Game.Client.Windows
{
    public partial class MainWindow : Window
    {
        public MainWindow()
        {
            InitializeComponent();
            ViewUtil.SetWindow(this);
            ViewUtil.Switch(new LoginView());
        }
    }
}
