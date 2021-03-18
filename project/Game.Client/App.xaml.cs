using System.Windows;
using Game.Client.Views;

namespace Game.Client.App
{
	public partial class App : Application
	{
		private void Application_Startup(object sender, StartupEventArgs e)
		{
			MainWindow window = new MainWindow();
			window.Show();
		}
	}
}
