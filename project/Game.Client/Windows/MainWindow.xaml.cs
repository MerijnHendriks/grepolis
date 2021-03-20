using System.Windows;
using Game.Client.Systems.View;
using Game.Client.Views;

namespace Game.Client.Windows
{
    public partial class MainWindow : Window
    {
        public MainWindow()
        {
            InitializeComponent();
            ViewController.SetWindow(this);
            ViewController.Switch(new CityView());
        }
    }
}
